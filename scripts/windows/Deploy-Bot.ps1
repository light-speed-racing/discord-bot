[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string]$ReleaseId,

    [Parameter(Mandatory = $true)]
    [string]$PackagePath,

    [Parameter(Mandatory = $true)]
    [string]$BotPath,

    [string]$EnvFilePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-FullPath([string]$Path) {
    return [IO.Path]::GetFullPath($Path).TrimEnd('\')
}

function Assert-NotReparsePoint([string]$Path) {
    $item = Get-Item -LiteralPath $Path -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Reparse points are not allowed in deployment paths: $Path"
    }
}

function Assert-NoReparseTree([string]$Path) {
    Assert-NotReparsePoint $Path
    if (Test-Path -LiteralPath $Path -PathType Container) {
        foreach ($item in Get-ChildItem -LiteralPath $Path -Recurse -Force) {
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Reparse points are not allowed in deployment packages: $($item.FullName)"
            }
        }
    }
}

function Assert-PathInside([string]$Parent, [string]$Candidate) {
    $parentPath = Get-FullPath $Parent
    $candidatePath = Get-FullPath $Candidate
    if (-not $candidatePath.StartsWith($parentPath + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path is outside the managed deployment directory: $candidatePath"
    }
}

function Assert-ReleaseDirectoryName([string]$ReleaseId, [string]$ReleasePath) {
    $escapedReleaseId = [Regex]::Escape($ReleaseId)
    if ([IO.Path]::GetFileName((Get-FullPath $ReleasePath)) -notmatch "^$escapedReleaseId(?:-[0-9a-f]{32})?$") {
        throw 'Release directory name does not match its release ID.'
    }
}

function Quote-WindowsArgument([string]$Value) {
    if ($Value.Contains('"')) {
        throw 'Windows command arguments cannot contain a quote character.'
    }
    return '"' + $Value + '"'
}

function Write-JsonAtomically([string]$Path, [object]$Value) {
    $temporaryPath = "$Path.tmp-$([Guid]::NewGuid().ToString('N'))"
    $json = $Value | ConvertTo-Json -Depth 5
    [IO.File]::WriteAllText($temporaryPath, $json, [Text.UTF8Encoding]::new($false))
    if (Test-Path -LiteralPath $Path) {
        [IO.File]::Replace($temporaryPath, $Path, [NullString]::Value)
    }
    else {
        Move-Item -LiteralPath $temporaryPath -Destination $Path
    }
}

function Set-SecretAcl([string]$Path, [string]$TaskUser) {
    $acl = [Security.AccessControl.FileSecurity]::new()
    if ((Get-Item -LiteralPath $Path).PSIsContainer) {
        $acl = [Security.AccessControl.DirectorySecurity]::new()
    }
    $acl.SetAccessRuleProtection($true, $false)
    $identities = @(
        [Security.Principal.NTAccount]::new($TaskUser),
        [Security.Principal.SecurityIdentifier]::new('S-1-5-18'),
        [Security.Principal.SecurityIdentifier]::new('S-1-5-32-544')
    )
    foreach ($identity in $identities) {
        $rule = [Security.AccessControl.FileSystemAccessRule]::new(
            $identity,
            [Security.AccessControl.FileSystemRights]::FullControl,
            [Security.AccessControl.AccessControlType]::Allow
        )
        $acl.AddAccessRule($rule)
    }
    Set-Acl -LiteralPath $Path -AclObject $acl
}

function Wait-TaskStopped([string]$TaskName, [int]$TimeoutSeconds = 30) {
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        if ((Get-ScheduledTask -TaskPath '\' -TaskName $TaskName).State -ne 'Running') {
            return
        }
        Start-Sleep -Milliseconds 500
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Scheduled Task '$TaskName' did not stop within $TimeoutSeconds seconds."
}

function Stop-BotTask([string]$TaskName) {
    if ((Get-ScheduledTask -TaskPath '\' -TaskName $TaskName).State -eq 'Running') {
        Stop-ScheduledTask -TaskPath '\' -TaskName $TaskName
        Wait-TaskStopped -TaskName $TaskName
    }
}

function Wait-Healthy(
    [string]$TaskName,
    [string]$HealthUrl,
    [string]$ExpectedReleaseId,
    [string]$ExpectedInstanceId,
    [int]$TimeoutSeconds = 60
) {
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    $lastError = $null
    do {
        try {
            if ((Get-ScheduledTask -TaskPath '\' -TaskName $TaskName).State -ne 'Running') {
                throw "Scheduled Task '$TaskName' is not running."
            }
            $health = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 5
            if (
                $health.status -eq 'ok' -and
                $health.deploymentReleaseId -eq $ExpectedReleaseId -and
                $health.deploymentInstanceId -eq $ExpectedInstanceId
            ) {
                return
            }
            $lastError = "Health response did not identify release $ExpectedReleaseId instance $ExpectedInstanceId."
        }
        catch {
            $lastError = $_.Exception.Message
        }
        Start-Sleep -Seconds 2
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Release $ExpectedReleaseId did not become healthy: $lastError"
}

$resolvedBotPath = (Resolve-Path -LiteralPath $BotPath).ProviderPath
$resolvedPackagePath = (Resolve-Path -LiteralPath $PackagePath).ProviderPath
Assert-NotReparsePoint $resolvedBotPath
Assert-NotReparsePoint $resolvedPackagePath

$resolvedEnvFilePath = $null
if (-not [string]::IsNullOrWhiteSpace($EnvFilePath)) {
    $resolvedEnvFilePath = (Resolve-Path -LiteralPath $EnvFilePath).ProviderPath
    if (-not (Test-Path -LiteralPath $resolvedEnvFilePath -PathType Leaf)) {
        throw 'EnvFilePath must identify a file.'
    }
    Assert-NotReparsePoint $resolvedEnvFilePath
}

$deploymentPath = Join-Path $resolvedBotPath '.deployment'
$releasesPath = Join-Path $deploymentPath 'releases'
$logsPath = Join-Path $deploymentPath 'logs'
$configPath = Join-Path $deploymentPath 'config.json'
$currentPath = Join-Path $deploymentPath 'current.json'
$launcherPath = Join-Path $deploymentPath 'run-bot.js'
$envPath = Join-Path $resolvedBotPath '.env'
foreach ($path in @($deploymentPath, $releasesPath, $logsPath, $configPath, $launcherPath)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Deployment setup is incomplete: $path"
    }
    Assert-NotReparsePoint $path
}
if ($null -ne $resolvedEnvFilePath -and (Test-Path -LiteralPath $envPath)) {
    Assert-NotReparsePoint $envPath
}

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
if ((Get-FullPath $config.botPath) -ne (Get-FullPath $resolvedBotPath)) {
    throw 'Deployment config belongs to a different bot path.'
}
if ([string]::IsNullOrWhiteSpace($config.taskName) -or [string]::IsNullOrWhiteSpace($config.nodePath)) {
    throw 'Deployment config is missing taskName or nodePath.'
}
$healthUri = [Uri]$config.healthUrl
if (
    -not $healthUri.IsAbsoluteUri -or
    $healthUri.Scheme -notin @('http', 'https') -or
    $healthUri.Host -notin @('localhost', '127.0.0.1', '::1') -or
    $healthUri.AbsolutePath.TrimEnd('/') -ne '/health'
) {
    throw 'Deployment config healthUrl must target the local /health endpoint.'
}
$nodePath = (Resolve-Path -LiteralPath $config.nodePath).ProviderPath
$nodeVersionOutput = (& $nodePath --version)
if ($LASTEXITCODE -ne 0 -or $nodeVersionOutput -notmatch '^v(?<major>\d+)\.') {
    throw 'Unable to determine the configured Node.js version.'
}
if ([int]$Matches.major -lt 24) {
    throw "Node.js 24 or newer is required; found $nodeVersionOutput."
}

$task = Get-ScheduledTask -TaskPath '\' -TaskName $config.taskName -ErrorAction Stop
if ([string]::IsNullOrWhiteSpace($task.Principal.UserId) -or $task.Principal.LogonType -ne 'Password') {
    throw "Scheduled Task '$($config.taskName)' must use a named user with Password logon."
}
$expectedArguments = "$(Quote-WindowsArgument $launcherPath) --bot-path $(Quote-WindowsArgument $resolvedBotPath)"
$taskActions = @($task.Actions)
if ($taskActions.Count -ne 1) {
    throw "Scheduled Task '$($config.taskName)' must contain exactly one action."
}
$expectedAction = $taskActions[0]
if (
    (Get-FullPath $expectedAction.Execute) -ne (Get-FullPath $nodePath) -or
    $expectedAction.Arguments -ne $expectedArguments -or
    (Get-FullPath $expectedAction.WorkingDirectory) -ne (Get-FullPath $resolvedBotPath)
) {
    throw "Scheduled Task '$($config.taskName)' action does not match this deployment."
}

$requiredPackagePaths = @('dist', 'package.json', 'yarn.lock', 'release.json', 'scripts\windows\Run-Bot.js')
foreach ($relativePath in $requiredPackagePaths) {
    $sourcePath = Join-Path $resolvedPackagePath $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath)) {
        throw "Deployment package is missing $relativePath."
    }
    Assert-NoReparseTree $sourcePath
}
$releaseMarker = Get-Content -LiteralPath (Join-Path $resolvedPackagePath 'release.json') -Raw | ConvertFrom-Json
if ($releaseMarker.releaseId -ne $ReleaseId) {
    throw 'Deployment package release.json does not match ReleaseId.'
}

$releaseDirectoryName = "$ReleaseId-$([Guid]::NewGuid().ToString('N'))"
$releasePath = Join-Path $releasesPath $releaseDirectoryName
Assert-PathInside -Parent $releasesPath -Candidate $releasePath
Assert-ReleaseDirectoryName -ReleaseId $ReleaseId -ReleasePath $releasePath

$lockPath = Join-Path $deploymentPath 'deploy.lock'
$lockStream = $null
try {
    try {
        $lockStream = [IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None')
    }
    catch {
        throw 'Another deployment is already running on this server.'
    }

    New-Item -ItemType Directory -Path $releasePath | Out-Null
    Copy-Item -LiteralPath (Join-Path $resolvedPackagePath 'dist') -Destination $releasePath -Recurse
    foreach ($filename in @('package.json', 'yarn.lock', 'release.json')) {
        Copy-Item -LiteralPath (Join-Path $resolvedPackagePath $filename) -Destination $releasePath
    }
    $releaseScriptsPath = Join-Path $releasePath 'scripts\windows'
    New-Item -ItemType Directory -Path $releaseScriptsPath -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $resolvedPackagePath 'scripts\windows\Run-Bot.js') -Destination $releaseScriptsPath

    $yarnPath = (Get-Command yarn.cmd -ErrorAction Stop).Source
    $nodeDirectory = Split-Path -Parent $nodePath
    $previousProcessPath = $env:PATH
    Push-Location $releasePath
    try {
        if ([string]::IsNullOrEmpty($previousProcessPath)) {
            $env:PATH = $nodeDirectory
        }
        else {
            $env:PATH = "$nodeDirectory;$previousProcessPath"
        }
        $previousErrorActionPreference = $ErrorActionPreference
        $yarnExitCode = $null
        try {
            $ErrorActionPreference = 'Continue'
            $null = & $yarnPath install --frozen-lockfile --production=true --non-interactive 2>&1
            $yarnExitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        if ($yarnExitCode -ne 0) {
            throw "yarn install failed with exit code $yarnExitCode."
        }
    }
    finally {
        $env:PATH = $previousProcessPath
        Pop-Location
    }

    $previousPointerJson = $null
    $previousReleaseId = $null
    $previousInstanceId = $null
    if (Test-Path -LiteralPath $currentPath) {
        Assert-NotReparsePoint $currentPath
        $previousPointerJson = Get-Content -LiteralPath $currentPath -Raw
        $previousPointer = $previousPointerJson | ConvertFrom-Json
        if ($previousPointer.releaseId -notmatch '^[0-9a-f]{40}$') {
            throw 'Existing release pointer has an invalid release ID.'
        }
        if (-not [IO.Path]::IsPathRooted([string]$previousPointer.releasePath)) {
            throw 'Existing release pointer must contain an absolute path.'
        }
        Assert-PathInside -Parent $releasesPath -Candidate $previousPointer.releasePath
        Assert-NotReparsePoint $previousPointer.releasePath
        $resolvedPreviousPath = (Resolve-Path -LiteralPath $previousPointer.releasePath).ProviderPath
        Assert-ReleaseDirectoryName -ReleaseId $previousPointer.releaseId -ReleasePath $resolvedPreviousPath
        $previousReleaseId = $previousPointer.releaseId
        $previousInstanceId = Split-Path -Leaf $resolvedPreviousPath
    }

    $previousLauncherBytes = [IO.File]::ReadAllBytes($launcherPath)
    $newLauncherPath = Join-Path $releaseScriptsPath 'Run-Bot.js'
    $envBackupPath = $null
    $envBackupCreated = $false
    $previousEnvAcl = $null
    $envMutationStarted = $false
    $taskWasRunning = (Get-ScheduledTask -TaskPath '\' -TaskName $config.taskName).State -eq 'Running'
    $launcherChanged = $false
    $switched = $false
    try {
        Stop-BotTask -TaskName $config.taskName

        if ($null -ne $resolvedEnvFilePath) {
            $envBackupDirectory = Join-Path $deploymentPath 'env-backups'
            New-Item -ItemType Directory -Path $envBackupDirectory -Force | Out-Null
            Set-SecretAcl -Path $envBackupDirectory -TaskUser $task.Principal.UserId
            $envBackupPath = Join-Path $envBackupDirectory "$releaseDirectoryName.env.bak"
            if (Test-Path -LiteralPath $envPath) {
                Assert-NotReparsePoint $envPath
                $previousEnvAcl = Get-Acl -LiteralPath $envPath
                Copy-Item -LiteralPath $envPath -Destination $envBackupPath
                $envBackupCreated = $true
                Set-SecretAcl -Path $envBackupPath -TaskUser $task.Principal.UserId
            }
            $envMutationStarted = $true
            Copy-Item -LiteralPath $resolvedEnvFilePath -Destination $envPath -Force
            Set-SecretAcl -Path $envPath -TaskUser $task.Principal.UserId
        }

        Copy-Item -LiteralPath $newLauncherPath -Destination $launcherPath -Force
        $launcherChanged = $true
        Write-JsonAtomically -Path $currentPath -Value ([ordered]@{
            releaseId   = $ReleaseId
            releasePath = $releasePath
        })
        $switched = $true
        Start-ScheduledTask -TaskPath '\' -TaskName $config.taskName
        Wait-Healthy `
            -TaskName $config.taskName `
            -HealthUrl $config.healthUrl `
            -ExpectedReleaseId $ReleaseId `
            -ExpectedInstanceId $releaseDirectoryName
        if ($envBackupCreated -and (Test-Path -LiteralPath $envBackupPath)) {
            Remove-Item -LiteralPath $envBackupPath -Force
            $envBackupCreated = $false
        }
    }
    catch {
        $deploymentError = $_
        $rollbackError = $null
        try {
            Stop-BotTask -TaskName $config.taskName
            if ($envMutationStarted) {
                if ($envBackupCreated -and (Test-Path -LiteralPath $envBackupPath)) {
                    Copy-Item -LiteralPath $envBackupPath -Destination $envPath -Force
                    if ($null -ne $previousEnvAcl) {
                        Set-Acl -LiteralPath $envPath -AclObject $previousEnvAcl
                    }
                }
                elseif (Test-Path -LiteralPath $envPath) {
                    Remove-Item -LiteralPath $envPath -Force
                }
            }
            if ($launcherChanged) {
                [IO.File]::WriteAllBytes($launcherPath, $previousLauncherBytes)
            }
            if ($switched) {
                if ($null -ne $previousPointerJson) {
                    $temporaryPointer = "$currentPath.rollback-$([Guid]::NewGuid().ToString('N'))"
                    [IO.File]::WriteAllText($temporaryPointer, $previousPointerJson, [Text.UTF8Encoding]::new($false))
                    if (Test-Path -LiteralPath $currentPath) {
                        [IO.File]::Replace($temporaryPointer, $currentPath, [NullString]::Value)
                    }
                    else {
                        Move-Item -LiteralPath $temporaryPointer -Destination $currentPath
                    }
                }
                elseif (Test-Path -LiteralPath $currentPath) {
                    Remove-Item -LiteralPath $currentPath -Force
                }
            }
            if ($taskWasRunning -and $null -ne $previousPointerJson) {
                Start-ScheduledTask -TaskPath '\' -TaskName $config.taskName
                Wait-Healthy `
                    -TaskName $config.taskName `
                    -HealthUrl $config.healthUrl `
                    -ExpectedReleaseId $previousReleaseId `
                    -ExpectedInstanceId $previousInstanceId
            }
            if ($envBackupCreated -and (Test-Path -LiteralPath $envBackupPath)) {
                Remove-Item -LiteralPath $envBackupPath -Force
                $envBackupCreated = $false
            }
        }
        catch {
            $rollbackError = $_.Exception.Message
        }
        if ($null -ne $rollbackError) {
            throw "Deployment failed: $($deploymentError.Exception.Message) Rollback also failed: $rollbackError. Protected environment backup, if created, remains at $envBackupPath."
        }
        throw $deploymentError
    }

    Write-Host "Release $ReleaseId is running and healthy."
}
finally {
    if ($null -ne $lockStream) {
        $lockStream.Dispose()
    }
}
