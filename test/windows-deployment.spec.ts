import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, it } from 'node:test';

const deployScript = resolve(__dirname, '../scripts/windows/Deploy-Bot.ps1');
const launcherScript = resolve(__dirname, '../scripts/windows/Run-Bot.js');
const oldReleaseId = '1111111111111111111111111111111111111111';
const newReleaseId = '2222222222222222222222222222222222222222';
const windowsOnly = process.platform === 'win32' ? false : 'PowerShell deployment transactions run on Windows CI';
const fixtureRoots: string[] = [];

function availablePowerShell(): string | undefined {
  const candidate = process.env.POWERSHELL_BINARY || (process.platform === 'win32' ? 'powershell.exe' : 'pwsh');
  const result = spawnSync(
    candidate,
    ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()'],
    {
      encoding: 'utf8',
    },
  );
  return result.status === 0 ? candidate : undefined;
}

const powerShell = availablePowerShell();

type Fixture = {
  root: string;
  botPath: string;
  packagePath: string;
  envFilePath: string;
  eventLogPath: string;
  yarnPathLog: string;
  afterPathLog: string;
  harnessPath: string;
};

function writeCommand(path: string, body: string) {
  writeFileSync(path, `@echo off\r\n${body}\r\n`);
}

function createFixture(): Fixture {
  assert.equal(existsSync(deployScript), true, `Missing deployment script: ${deployScript}`);
  assert.equal(existsSync(launcherScript), true, `Missing deployment launcher: ${launcherScript}`);

  const root = realpathSync(mkdtempSync(join(tmpdir(), 'discord-bot deployment ')));
  fixtureRoots.push(root);
  const botPath = join(root, 'bot');
  const deploymentPath = join(botPath, '.deployment');
  const oldReleasePath = join(deploymentPath, 'releases', oldReleaseId);
  const packagePath = join(root, 'package');
  const toolsPath = join(root, 'tools');
  const envFilePath = join(root, 'incoming.env');
  const eventLogPath = join(root, 'events.log');
  const yarnPathLog = join(root, 'yarn-path.log');
  const afterPathLog = join(root, 'after-path.log');
  const harnessPath = join(root, 'deploy-harness.ps1');
  const nodePath = process.execPath;

  mkdirSync(join(oldReleasePath, 'dist'), { recursive: true });
  mkdirSync(join(deploymentPath, 'logs'), { recursive: true });
  mkdirSync(join(packagePath, 'dist'), { recursive: true });
  mkdirSync(join(packagePath, 'scripts', 'windows'), { recursive: true });
  mkdirSync(toolsPath, { recursive: true });
  copyFileSync(launcherScript, join(deploymentPath, 'run-bot.js'));
  copyFileSync(launcherScript, join(packagePath, 'scripts', 'windows', 'Run-Bot.js'));
  writeFileSync(join(oldReleasePath, 'dist', 'main.js'), 'module.exports = {};');
  writeFileSync(join(packagePath, 'dist', 'main.js'), 'module.exports = {};');
  writeFileSync(join(packagePath, 'package.json'), '{"name":"deployment-fixture","private":true}');
  writeFileSync(join(packagePath, 'yarn.lock'), '# yarn lockfile v1\n');
  writeFileSync(join(packagePath, 'release.json'), JSON.stringify({ releaseId: newReleaseId }));
  writeFileSync(join(botPath, '.env'), 'BOT_SECRET=old-value\n');
  writeFileSync(envFilePath, 'BOT_SECRET=new-value\n');
  writeFileSync(
    join(deploymentPath, 'config.json'),
    JSON.stringify({
      botPath,
      taskName: 'LightSpeedDiscordBot',
      nodePath,
      healthUrl: 'http://127.0.0.1:3000/health',
    }),
  );
  writeFileSync(
    join(deploymentPath, 'current.json'),
    JSON.stringify({ releaseId: oldReleaseId, releasePath: oldReleasePath }),
  );

  writeCommand(
    join(toolsPath, 'yarn.cmd'),
    'echo yarn-install>>"%DEPLOY_TEST_EVENTS%"\r\nset PATH>"%DEPLOY_TEST_YARN_PATH%"\r\nif "%DEPLOY_TEST_YARN_WARNING%"=="1" echo fixture yarn warning 1>&2\r\nexit /b %DEPLOY_TEST_YARN_EXIT%',
  );

  writeFileSync(
    harnessPath,
    String.raw`param(
    [string]$DeployScript,
    [string]$ReleaseId,
    [string]$PackagePath,
    [string]$BotPath,
    [string]$EnvFilePath,
    [string]$NodePath,
    [string]$EventLogPath,
    [ValidateSet('success', 'wrong-health', 'stale-instance', 'stop-failure')]
    [string]$HealthMode = 'success'
)

$global:TaskState = 'Running'
$global:StartCount = 0
$global:SleepFailuresRemaining = if ($HealthMode -in @('wrong-health', 'stale-instance')) { 1 } else { 0 }
$global:TaskUser = [Security.Principal.WindowsIdentity]::GetCurrent().Name

function Add-Event([string]$Value) {
    Add-Content -LiteralPath $EventLogPath -Value $Value
}

function Assert-RootTaskPath([string]$TaskPath) {
    if ($TaskPath -ne [string][char]92) {
        throw "Scheduled Task operation escaped the root path: $TaskPath"
    }
}

function Get-ScheduledTask {
    [CmdletBinding()]
    param([string]$TaskName, [string]$TaskPath)
    Assert-RootTaskPath $TaskPath
    [pscustomobject]@{
        State = $global:TaskState
        Principal = [pscustomobject]@{ UserId = $global:TaskUser; LogonType = 'Password' }
        Actions = @([pscustomobject]@{
            Execute = $NodePath
            Arguments = '"' + (Join-Path $BotPath '.deployment\run-bot.js') + '" --bot-path "' + $BotPath + '"'
            WorkingDirectory = $BotPath
        })
    }
}

function Stop-ScheduledTask {
    param([string]$TaskName, [string]$TaskPath)
    Assert-RootTaskPath $TaskPath
    Add-Event 'task-stop'
    if ($HealthMode -eq 'stop-failure') {
        throw 'Fixture could not stop the task.'
    }
    $global:TaskState = 'Stopped'
}

function Start-ScheduledTask {
    param([string]$TaskName, [string]$TaskPath)
    Assert-RootTaskPath $TaskPath
    $global:StartCount++
    Add-Event "task-start-$global:StartCount"
    $global:TaskState = 'Running'
}

function Invoke-RestMethod {
    [CmdletBinding()]
    param([string]$Uri, [string]$Method, [int]$TimeoutSec)
    Add-Event "health-$global:StartCount"
    $pointer = Get-Content -LiteralPath (Join-Path $BotPath '.deployment\current.json') -Raw | ConvertFrom-Json
    $instanceId = Split-Path -Leaf $pointer.releasePath
    if ($HealthMode -eq 'wrong-health' -and $global:StartCount -eq 1) {
        return [pscustomobject]@{
            status = 'ok'
            deploymentReleaseId = 'ffffffffffffffffffffffffffffffffffffffff'
            deploymentInstanceId = $instanceId
        }
    }
    if ($HealthMode -eq 'stale-instance' -and $global:StartCount -eq 1) {
        return [pscustomobject]@{
            status = 'ok'
            deploymentReleaseId = $pointer.releaseId
            deploymentInstanceId = 'stale-instance'
        }
    }
    return [pscustomobject]@{
        status = 'ok'
        deploymentReleaseId = $pointer.releaseId
        deploymentInstanceId = $instanceId
    }
}

function Start-Sleep {
    param([int]$Seconds, [int]$Milliseconds)
    if ($global:SleepFailuresRemaining -gt 0) {
        $global:SleepFailuresRemaining--
        throw 'Fixture ended the failed health wait.'
    }
}

function Get-Acl { param([string]$LiteralPath) return [pscustomobject]@{ fixture = 'acl' } }
function Set-Acl { param([string]$LiteralPath, [object]$AclObject) }

$deployArguments = @{
    ReleaseId = $ReleaseId
    PackagePath = $PackagePath
    BotPath = $BotPath
}
if (-not [string]::IsNullOrWhiteSpace($EnvFilePath)) {
    $deployArguments.EnvFilePath = $EnvFilePath
}

& $DeployScript @deployArguments
[IO.File]::WriteAllText($env:DEPLOY_TEST_AFTER_PATH, $env:PATH)
`,
  );

  return { root, botPath, packagePath, envFilePath, eventLogPath, yarnPathLog, afterPathLog, harnessPath };
}

function runDeployment(
  fixture: Fixture,
  options: {
    releaseId?: string;
    yarnExit?: number;
    yarnWarning?: boolean;
    healthMode?: 'success' | 'wrong-health' | 'stale-instance' | 'stop-failure';
    withEnv?: boolean;
  } = {},
) {
  const config = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'config.json'), 'utf8')) as {
    nodePath: string;
  };
  const args = [
    '-NoLogo',
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    fixture.harnessPath,
    '-DeployScript',
    deployScript,
    '-ReleaseId',
    options.releaseId ?? newReleaseId,
    '-PackagePath',
    fixture.packagePath,
    '-BotPath',
    fixture.botPath,
    '-NodePath',
    config.nodePath,
    '-EventLogPath',
    fixture.eventLogPath,
    '-HealthMode',
    options.healthMode ?? 'success',
  ];
  if (options.withEnv) {
    args.push('-EnvFilePath', fixture.envFilePath);
  }

  const seededPath = `${join(fixture.root, 'tools')};${process.env.PATH ?? ''}`;

  return spawnSync('powershell.exe', args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      DEPLOY_TEST_EVENTS: fixture.eventLogPath,
      DEPLOY_TEST_YARN_EXIT: String(options.yarnExit ?? 0),
      DEPLOY_TEST_YARN_WARNING: options.yarnWarning ? '1' : '0',
      DEPLOY_TEST_YARN_PATH: fixture.yarnPathLog,
      DEPLOY_TEST_AFTER_PATH: fixture.afterPathLog,
      PATH: seededPath,
    },
  });
}

function events(fixture: Fixture): string[] {
  if (!existsSync(fixture.eventLogPath)) {
    return [];
  }
  return readFileSync(fixture.eventLogPath, 'utf8').split(/\r?\n/).filter(Boolean);
}

function environmentBackups(fixture: Fixture): string[] {
  const backupPath = join(fixture.botPath, '.deployment', 'env-backups');
  return existsSync(backupPath) ? readdirSync(backupPath) : [];
}

afterEach(() => {
  while (fixtureRoots.length > 0) {
    const fixtureRoot = fixtureRoots.pop();
    if (fixtureRoot) {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }
});

describe('Windows deployment transaction', { concurrency: false, skip: windowsOnly }, () => {
  it('does not stop the running task when dependency installation fails', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { yarnExit: 9 });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /yarn install failed with exit code 9/i);
    assert.deepEqual(events(fixture), ['yarn-install']);
    assert.equal(readFileSync(join(fixture.botPath, '.env'), 'utf8'), 'BOT_SECRET=old-value\n');
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, oldReleaseId);
  });

  it('continues when yarn writes a warning to stderr but exits successfully', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { yarnWarning: true });

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(events(fixture), ['yarn-install', 'task-stop', 'task-start-1', 'health-1']);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, newReleaseId);
  });

  it('runs yarn with the configured Node directory first and restores PATH afterwards', () => {
    const fixture = createFixture();
    const config = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'config.json'), 'utf8')) as {
      nodePath: string;
    };
    const seededPath = `${join(fixture.root, 'tools')};${process.env.PATH ?? ''}`;

    const result = runDeployment(fixture);

    assert.equal(result.status, 0, result.stderr);
    const yarnPath = readFileSync(fixture.yarnPathLog, 'utf8')
      .trim()
      .replace(/^[^=]*=/, '');
    assert.equal(yarnPath.split(';')[0].toLowerCase(), dirname(config.nodePath).toLowerCase());
    assert.equal(readFileSync(fixture.afterPathLog, 'utf8'), seededPath);
  });

  it('installs before stopping, switches the pointer, and verifies the new release', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { withEnv: true });

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(events(fixture), ['yarn-install', 'task-stop', 'task-start-1', 'health-1']);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, newReleaseId);
    assert.equal(readFileSync(join(fixture.botPath, '.env'), 'utf8'), 'BOT_SECRET=new-value\n');
    assert.deepEqual(environmentBackups(fixture), []);
  });

  it('restores the prior pointer and environment when the new release is not healthy', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { withEnv: true, healthMode: 'wrong-health' });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /failed health wait|did not become healthy/i);
    assert.deepEqual(events(fixture), [
      'yarn-install',
      'task-stop',
      'task-start-1',
      'health-1',
      'task-stop',
      'task-start-2',
      'health-2',
    ]);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, oldReleaseId);
    assert.equal(readFileSync(join(fixture.botPath, '.env'), 'utf8'), 'BOT_SECRET=old-value\n');
    assert.deepEqual(environmentBackups(fixture), []);
  });

  it('rejects a stale process reporting the new SHA with the wrong deployment instance', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { healthMode: 'stale-instance' });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /failed health wait|did not become healthy/i);
    assert.deepEqual(events(fixture), [
      'yarn-install',
      'task-stop',
      'task-start-1',
      'health-1',
      'task-stop',
      'task-start-2',
      'health-2',
    ]);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, oldReleaseId);
  });

  it('creates a new immutable release instance when the same SHA is deployed again', () => {
    const fixture = createFixture();

    const firstResult = runDeployment(fixture);
    assert.equal(firstResult.status, 0, firstResult.stderr);
    const firstPointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8')) as {
      releaseId: string;
      releasePath: string;
    };

    const secondResult = runDeployment(fixture);
    assert.equal(secondResult.status, 0, secondResult.stderr);
    const secondPointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8')) as {
      releaseId: string;
      releasePath: string;
    };

    assert.equal(firstPointer.releaseId, newReleaseId);
    assert.equal(secondPointer.releaseId, newReleaseId);
    assert.notEqual(secondPointer.releasePath, firstPointer.releasePath);
    assert.equal(existsSync(join(firstPointer.releasePath, 'dist', 'main.js')), true);
    assert.equal(existsSync(join(secondPointer.releasePath, 'dist', 'main.js')), true);
  });

  it('leaves the prior pointer and environment untouched when the task cannot be stopped', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { withEnv: true, healthMode: 'stop-failure' });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /could not stop the task/i);
    assert.deepEqual(events(fixture), ['yarn-install', 'task-stop', 'task-stop']);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, oldReleaseId);
    assert.equal(readFileSync(join(fixture.botPath, '.env'), 'utf8'), 'BOT_SECRET=old-value\n');
  });

  it('rejects a package whose release marker does not match before installation or shutdown', () => {
    const fixture = createFixture();

    const result = runDeployment(fixture, { releaseId: '3333333333333333333333333333333333333333' });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /release\.json does not match ReleaseId/i);
    assert.deepEqual(events(fixture), []);
    const pointer = JSON.parse(readFileSync(join(fixture.botPath, '.deployment', 'current.json'), 'utf8'));
    assert.equal(pointer.releaseId, oldReleaseId);
  });
});

it(
  'parses every deployment PowerShell script without syntax errors',
  { skip: powerShell ? false : 'PowerShell unavailable' },
  () => {
    if (!powerShell) {
      return;
    }

    const result = spawnSync(
      powerShell,
      [
        '-NoLogo',
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        String.raw`$failed = $false
Get-ChildItem -LiteralPath $env:DEPLOY_SCRIPTS_PATH -Filter *.ps1 -Recurse | ForEach-Object {
    $tokens = $null
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$tokens, [ref]$errors) | Out-Null
    if ($errors.Count -gt 0) {
        $failed = $true
        $errors | ForEach-Object { [Console]::Error.WriteLine($_.ToString()) }
    }
}
if ($failed) { exit 1 }`,
      ],
      {
        encoding: 'utf8',
        env: { ...process.env, DEPLOY_SCRIPTS_PATH: resolve(__dirname, '../scripts') },
      },
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
  },
);
