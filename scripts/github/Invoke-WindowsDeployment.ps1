[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string] $ArchivePath,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string] $ReleaseId,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $BotPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot 'BotEnvironment.ps1')

function Get-RequiredEnvironmentValue {
    param([Parameter(Mandatory = $true)][string] $Name)

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Required environment variable '$Name' is not set."
    }

    return $value
}

function ConvertTo-Utf16Base64 {
    param([Parameter(Mandatory = $true)][string] $Value)

    return [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Value))
}

function ConvertTo-Utf8Base64 {
    param([Parameter(Mandatory = $true)][string] $Value)

    return [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Value))
}

function ConvertTo-OpenSshText {
    param([Parameter(Mandatory = $true)][string] $Value)

    $normalized = $Value.Replace("`r`n", "`n").Replace("`r", "`n")
    return $normalized.TrimEnd("`n") + "`n"
}

function Protect-LocalDirectory {
    param([Parameter(Mandatory = $true)][string] $Path)

    $acl = [Security.AccessControl.DirectorySecurity]::new()
    $acl.SetAccessRuleProtection($true, $false)
    $inheritance = [Security.AccessControl.InheritanceFlags]::ContainerInherit -bor
        [Security.AccessControl.InheritanceFlags]::ObjectInherit
    $propagation = [Security.AccessControl.PropagationFlags]::None
    $rights = [Security.AccessControl.FileSystemRights]::FullControl
    $allow = [Security.AccessControl.AccessControlType]::Allow
    $identities = @(
        [Security.Principal.WindowsIdentity]::GetCurrent().User,
        [Security.Principal.SecurityIdentifier]::new('S-1-5-18'),
        [Security.Principal.SecurityIdentifier]::new('S-1-5-32-544')
    )

    foreach ($identity in $identities) {
        $rule = [Security.AccessControl.FileSystemAccessRule]::new(
            $identity,
            $rights,
            $inheritance,
            $propagation,
            $allow
        )
        [void] $acl.AddAccessRule($rule)
    }

    Set-Acl -LiteralPath $Path -AclObject $acl
}

function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory = $true)][string] $Executable,
        [Parameter(Mandatory = $true)][string[]] $Arguments,
        [Parameter(Mandatory = $true)][string] $FailureMessage
    )

    # Capture native output so a remote command cannot accidentally echo a secret
    # into the GitHub Actions log. Deploy-Bot.ps1 reports only non-sensitive status.
    $output = & $Executable @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "$FailureMessage (exit code $exitCode)."
    }

    return $output
}

$hostName = (Get-RequiredEnvironmentValue -Name 'PATTY_HOST').Trim()
$userName = (Get-RequiredEnvironmentValue -Name 'PATTY_USERNAME').Trim()
$privateKey = Get-RequiredEnvironmentValue -Name 'SSH_KEY'
$knownHosts = Get-RequiredEnvironmentValue -Name 'SSH_KNOWN_HOSTS'
$portValue = [Environment]::GetEnvironmentVariable('PATTY_PORT')
$environmentFile = New-BotEnvironmentContent

if ($hostName -notmatch '^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$') {
    throw 'PATTY_HOST must be a DNS name or IPv4 address without command-line metacharacters.'
}
if ($userName -notmatch '^[A-Za-z0-9][A-Za-z0-9_.-]*$') {
    throw 'PATTY_USERNAME contains unsupported characters.'
}

$port = 22
if (-not [string]::IsNullOrWhiteSpace($portValue)) {
    if (-not [int]::TryParse($portValue, [ref] $port) -or $port -lt 1 -or $port -gt 65535) {
        throw 'PATTY_PORT must be an integer from 1 through 65535.'
    }
}

$resolvedArchive = (Resolve-Path -LiteralPath $ArchivePath).Path
if ([IO.Path]::GetExtension($resolvedArchive) -ine '.zip') {
    throw 'ArchivePath must refer to a ZIP archive.'
}

$deploymentId = [Guid]::NewGuid().ToString('N')
$remoteStageName = ".lsr-deploy-$deploymentId"
$remoteArchive = "$userName@${hostName}:$remoteStageName/release.zip"
$remoteEnvironment = "$userName@${hostName}:$remoteStageName/environment.env"
$remoteTarget = "$userName@$hostName"
$localStage = Join-Path ([IO.Path]::GetTempPath()) "lsr-deploy-$deploymentId"
$utf8NoBom = [Text.UTF8Encoding]::new($false)

New-Item -ItemType Directory -Path $localStage -ErrorAction Stop | Out-Null

$keyPath = Join-Path $localStage 'id_ed25519'
$knownHostsPath = Join-Path $localStage 'known_hosts'
$environmentPath = Join-Path $localStage 'environment.env'
$remoteStageCreated = $false

try {
    Protect-LocalDirectory -Path $localStage
    [IO.File]::WriteAllText($keyPath, (ConvertTo-OpenSshText -Value $privateKey), $utf8NoBom)
    [IO.File]::WriteAllText($knownHostsPath, (ConvertTo-OpenSshText -Value $knownHosts), $utf8NoBom)
    if (-not [string]::IsNullOrEmpty($environmentFile)) {
        [IO.File]::WriteAllText($environmentPath, $environmentFile, $utf8NoBom)
    }

    $commonSshOptions = @(
        '-o', 'BatchMode=yes',
        '-o', 'IdentitiesOnly=yes',
        '-o', 'StrictHostKeyChecking=yes',
        '-o', "UserKnownHostsFile=$knownHostsPath",
        '-o', 'ConnectTimeout=15',
        '-i', $keyPath
    )
    $sshArguments = @('-p', "$port") + $commonSshOptions
    $scpArguments = @('-P', "$port") + $commonSshOptions

    $initializeRemoteStage = @'
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$stageName = '__STAGE_NAME__'
if ($stageName -notmatch '^\.lsr-deploy-[0-9a-f]{32}$') {
    throw 'Invalid deployment staging name.'
}
$profileRoot = [IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\')
$stagePath = [IO.Path]::GetFullPath((Join-Path $profileRoot $stageName))
if (-not $stagePath.StartsWith("$profileRoot\", [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Deployment staging path escaped the SSH user profile.'
}
if (Test-Path -LiteralPath $stagePath) {
    throw 'Deployment staging path already exists.'
}
New-Item -ItemType Directory -Path $stagePath -ErrorAction Stop | Out-Null
$currentSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
& icacls.exe $stagePath '/inheritance:r' '/grant:r' "*$($currentSid):(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Could not protect deployment staging directory.'
}
'@
    $initializeRemoteStage = $initializeRemoteStage.Replace('__STAGE_NAME__', $remoteStageName)
    $initializeCommand = ConvertTo-Utf16Base64 -Value $initializeRemoteStage
    [void] (Invoke-NativeCommand -Executable 'ssh.exe' -Arguments ($sshArguments + @(
                $remoteTarget,
                'powershell.exe', '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', $initializeCommand
            )) -FailureMessage 'Could not initialize the remote deployment staging directory')
    $remoteStageCreated = $true

    [void] (Invoke-NativeCommand -Executable 'scp.exe' -Arguments ($scpArguments + @(
                $resolvedArchive,
                $remoteArchive
            )) -FailureMessage 'Could not upload the release archive')

    $hasEnvironmentFile = Test-Path -LiteralPath $environmentPath -PathType Leaf
    if ($hasEnvironmentFile) {
        [void] (Invoke-NativeCommand -Executable 'scp.exe' -Arguments ($scpArguments + @(
                    $environmentPath,
                    $remoteEnvironment
                )) -FailureMessage 'Could not upload the environment file')
    }

    $botPathBase64 = ConvertTo-Utf8Base64 -Value $BotPath
    $deployRemotePackage = @'
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version Latest
$stageName = '__STAGE_NAME__'
$releaseId = '__RELEASE_ID__'
$botPathBase64 = '__BOT_PATH_BASE64__'
$hasEnvironmentFile = [Convert]::ToBoolean('__HAS_ENVIRONMENT_FILE__')
$profileRoot = [IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\')
$stagePath = [IO.Path]::GetFullPath((Join-Path $profileRoot $stageName))

try {
    if ($stageName -notmatch '^\.lsr-deploy-[0-9a-f]{32}$' -or
        $releaseId -notmatch '^[0-9a-f]{40}$' -or
        -not $stagePath.StartsWith("$profileRoot\", [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Invalid deployment input.'
    }

    $stageItem = Get-Item -LiteralPath $stagePath -Force
    if (-not $stageItem.PSIsContainer -or ($stageItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw 'Deployment staging path is not a physical directory.'
    }

    $archivePath = Join-Path $stagePath 'release.zip'
    if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
        throw 'Release archive was not uploaded.'
    }

    $packagePath = Join-Path $stagePath 'package'
    Expand-Archive -LiteralPath $archivePath -DestinationPath $packagePath -ErrorAction Stop
    $deployScript = Join-Path $packagePath 'scripts\windows\Deploy-Bot.ps1'
    if (-not (Test-Path -LiteralPath $deployScript -PathType Leaf)) {
        throw 'The release package does not contain Deploy-Bot.ps1.'
    }

    $botPath = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($botPathBase64))
    if ([string]::IsNullOrWhiteSpace($botPath) -or $botPath.Contains([char]0)) {
        throw 'BotPath is invalid.'
    }

    $deployArguments = @{
        ReleaseId = $releaseId
        PackagePath = $packagePath
        BotPath = $botPath
    }
    if ($hasEnvironmentFile) {
        $environmentPath = Join-Path $stagePath 'environment.env'
        if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) {
            throw 'Environment file was not uploaded.'
        }
        $deployArguments.EnvFilePath = $environmentPath
    }

    & $deployScript @deployArguments
}
finally {
    if (Test-Path -LiteralPath $stagePath) {
        Remove-Item -LiteralPath $stagePath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
'@
    $deployRemotePackage = $deployRemotePackage.Replace('__STAGE_NAME__', $remoteStageName)
    $deployRemotePackage = $deployRemotePackage.Replace('__RELEASE_ID__', $ReleaseId)
    $deployRemotePackage = $deployRemotePackage.Replace('__BOT_PATH_BASE64__', $botPathBase64)
    $deployRemotePackage = $deployRemotePackage.Replace('__HAS_ENVIRONMENT_FILE__', $hasEnvironmentFile.ToString())
    $deployCommand = ConvertTo-Utf16Base64 -Value $deployRemotePackage
    [void] (Invoke-NativeCommand -Executable 'ssh.exe' -Arguments ($sshArguments + @(
                $remoteTarget,
                'powershell.exe', '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', $deployCommand
            )) -FailureMessage 'Remote deployment failed')
}
finally {
    if ($remoteStageCreated) {
        $cleanupRemoteStage = @'
$ErrorActionPreference = 'SilentlyContinue'
$stageName = '__STAGE_NAME__'
if ($stageName -match '^\.lsr-deploy-[0-9a-f]{32}$') {
    $profileRoot = [IO.Path]::GetFullPath($env:USERPROFILE).TrimEnd('\')
    $stagePath = [IO.Path]::GetFullPath((Join-Path $profileRoot $stageName))
    if ($stagePath.StartsWith("$profileRoot\", [StringComparison]::OrdinalIgnoreCase) -and
        (Test-Path -LiteralPath $stagePath)) {
        Remove-Item -LiteralPath $stagePath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
'@
        $cleanupRemoteStage = $cleanupRemoteStage.Replace('__STAGE_NAME__', $remoteStageName)
        $cleanupCommand = ConvertTo-Utf16Base64 -Value $cleanupRemoteStage
        try {
            [void] (Invoke-NativeCommand -Executable 'ssh.exe' -Arguments ($sshArguments + @(
                        $remoteTarget,
                        'powershell.exe', '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', $cleanupCommand
                    )) -FailureMessage 'Could not clean the remote deployment staging directory')
        }
        catch {
            Write-Warning 'Remote staging cleanup could not be confirmed.'
        }
    }

    if (Test-Path -LiteralPath $localStage) {
        Remove-Item -LiteralPath $localStage -Recurse -Force -ErrorAction SilentlyContinue
    }
}
