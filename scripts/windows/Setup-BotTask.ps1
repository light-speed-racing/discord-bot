[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BotPath,

    [Parameter(Mandatory = $true)]
    [string]$HealthUrl,

    [string]$TaskName = 'LightSpeedDiscordBot',

    [string]$NodePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Setup-BotTask.ps1 must be run from an elevated PowerShell session.'
    }
}

function Assert-NotReparsePoint([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        $item = Get-Item -LiteralPath $Path -Force
        if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Reparse points are not allowed in deployment paths: $Path"
        }
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
    Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
}

Assert-Administrator

$resolvedBotPath = (Resolve-Path -LiteralPath $BotPath).ProviderPath
$envPath = Join-Path $resolvedBotPath '.env'
if (-not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
    throw "The bot path must contain the existing .env file: $resolvedBotPath"
}
Assert-NotReparsePoint $resolvedBotPath
Assert-NotReparsePoint $envPath

$healthUri = [Uri]$HealthUrl
if (-not $healthUri.IsAbsoluteUri -or $healthUri.Scheme -notin @('http', 'https')) {
    throw 'HealthUrl must be an absolute HTTP or HTTPS URL.'
}
if ($healthUri.Host -notin @('localhost', '127.0.0.1', '::1') -or $healthUri.AbsolutePath.TrimEnd('/') -ne '/health') {
    throw 'HealthUrl must target the local /health endpoint.'
}

if ([string]::IsNullOrWhiteSpace($NodePath)) {
    $NodePath = (Get-Command node.exe -ErrorAction Stop).Source
}
$resolvedNodePath = (Resolve-Path -LiteralPath $NodePath).ProviderPath
if ([IO.Path]::GetFileName($resolvedNodePath) -ne 'node.exe') {
    throw "NodePath must point to node.exe: $resolvedNodePath"
}

if ([string]::IsNullOrWhiteSpace($TaskName)) {
    throw 'TaskName cannot be empty.'
}
if ($null -ne (Get-ScheduledTask -TaskPath '\' -TaskName $TaskName -ErrorAction SilentlyContinue)) {
    throw "Scheduled Task '$TaskName' already exists and will not be overwritten."
}

$deploymentPath = Join-Path $resolvedBotPath '.deployment'
$launcherPath = Join-Path $deploymentPath 'run-bot.js'
$configPath = Join-Path $deploymentPath 'config.json'
$sourceLauncherPath = Join-Path $PSScriptRoot 'Run-Bot.js'
Assert-NotReparsePoint $deploymentPath
Assert-NotReparsePoint (Join-Path $deploymentPath 'releases')
Assert-NotReparsePoint (Join-Path $deploymentPath 'logs')
Assert-NotReparsePoint $launcherPath
Assert-NotReparsePoint $configPath
Assert-NotReparsePoint $sourceLauncherPath
New-Item -ItemType Directory -Path $deploymentPath -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $deploymentPath 'releases') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $deploymentPath 'logs') -Force | Out-Null
Copy-Item -LiteralPath $sourceLauncherPath -Destination $launcherPath -Force

$config = [ordered]@{
    botPath   = $resolvedBotPath
    taskName  = $TaskName
    nodePath  = $resolvedNodePath
    healthUrl = $healthUri.AbsoluteUri
}
Write-JsonAtomically -Path $configPath -Value $config

$arguments = "$(Quote-WindowsArgument $launcherPath) --bot-path $(Quote-WindowsArgument $resolvedBotPath)"
$action = New-ScheduledTaskAction -Execute $resolvedNodePath -Argument $arguments -WorkingDirectory $resolvedBotPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable

$defaultUser = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$credential = Get-Credential -UserName $defaultUser -Message 'Credentials for the Discord bot Scheduled Task'
$password = $credential.GetNetworkCredential().Password
try {
    Register-ScheduledTask `
        -TaskPath '\' `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -User $credential.UserName `
        -Password $password `
        -RunLevel Limited | Out-Null
}
finally {
    $password = $null
    $credential = $null
}

Write-Host "Registered Scheduled Task '$TaskName'. It has not been started."
Write-Host 'Stop the existing Git Bash bot before starting the task for the first time.'
