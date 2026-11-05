import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

const scriptPath = path.resolve(__dirname, '../scripts/github/Invoke-WindowsDeployment.ps1');
const releaseId = 'a'.repeat(40);
const hostileBotPath = "C:\\Bots\\O'Brien; Write-Error 'must stay data'";

type CapturedCall = {
  command: 'ssh' | 'scp';
  arguments: string[];
  keyHasCarriageReturn?: boolean;
  keyEndsWithLineFeed?: boolean;
  knownHostsHasCarriageReturn?: boolean;
  knownHostsEndsWithLineFeed?: boolean;
  environmentBase64?: string;
};
type HarnessResult = { succeeded: boolean; error: string; calls: CapturedCall[] };

describe('Windows deployment transport', { skip: process.platform !== 'win32' }, () => {
  let fixturePath: string;
  let archivePath: string;
  let harnessPath: string;

  beforeEach(() => {
    fixturePath = fs.mkdtempSync(path.join(os.tmpdir(), 'deployment transport '));
    archivePath = path.join(fixturePath, 'release.zip');
    harnessPath = path.join(fixturePath, 'harness.ps1');
    fs.writeFileSync(archivePath, 'fixture archive');
    fs.writeFileSync(
      harnessPath,
      String.raw`
$ErrorActionPreference = 'Stop'
$global:CapturedCalls = [Collections.Generic.List[object]]::new()
$global:ScpFailed = $false

function global:ssh.exe {
    $arguments = @($args | ForEach-Object { "$_" })
    $keyPath = $arguments[[Array]::IndexOf($arguments, '-i') + 1]
    $knownHostsOption = $arguments | Where-Object { $_ -like 'UserKnownHostsFile=*' } | Select-Object -First 1
    $knownHostsPath = $knownHostsOption.Substring('UserKnownHostsFile='.Length)
    $keyText = [IO.File]::ReadAllText($keyPath)
    $knownHostsText = [IO.File]::ReadAllText($knownHostsPath)
    $global:CapturedCalls.Add([pscustomobject]@{
        command = 'ssh'
        arguments = $arguments
        keyHasCarriageReturn = $keyText.Contains([char]13)
        keyEndsWithLineFeed = $keyText.EndsWith([char]10)
        knownHostsHasCarriageReturn = $knownHostsText.Contains([char]13)
        knownHostsEndsWithLineFeed = $knownHostsText.EndsWith([char]10)
    }) | Out-Null
    $global:LASTEXITCODE = 0
}

function global:scp.exe {
    $arguments = @($args | ForEach-Object { "$_" })
    $sourcePath = $arguments[$arguments.Count - 2]
    $environmentBase64 = $null
    if ($sourcePath.EndsWith('environment.env')) {
        $environmentBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($sourcePath))
    }
    $global:CapturedCalls.Add([pscustomobject]@{
        command = 'scp'
        arguments = $arguments
        environmentBase64 = $environmentBase64
    }) | Out-Null
    if ($env:TEST_FAIL_SCP -eq '1' -and -not $global:ScpFailed) {
        $global:ScpFailed = $true
        $global:LASTEXITCODE = 23
        return
    }
    $global:LASTEXITCODE = 0
}

$succeeded = $false
$errorMessage = ''
try {
    $transportArguments = @{
        ArchivePath = $env:TEST_ARCHIVE_PATH
        ReleaseId = $env:TEST_RELEASE_ID
        BotPath = $env:TEST_BOT_PATH
    }
    & $env:TEST_TRANSPORT_SCRIPT @transportArguments
    $succeeded = $true
}
catch {
    $errorMessage = $_.Exception.Message
}

[ordered]@{
    succeeded = $succeeded
    error = $errorMessage
    calls = @($global:CapturedCalls)
} | ConvertTo-Json -Depth 8 -Compress
`,
    );
  });

  afterEach(() => {
    fs.rmSync(fixturePath, { recursive: true, force: true });
  });

  function runHarness(failScp = false): HarnessResult {
    const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', harnessPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATTY_HOST: 'deploy.example.test',
        PATTY_USERNAME: 'deploy-user',
        PATTY_PORT: '2222',
        SSH_KEY: 'secret-private-key\r\nsecond-line-without-final-newline',
        SSH_KNOWN_HOSTS: 'deploy.example.test ssh-ed25519 secret-host-key\r\nsecond-host',
        BOT_ENV_FILE: 'DISCORD__TOKEN=secret-discord-token\r\nVALUE=unchanged',
        TEST_TRANSPORT_SCRIPT: scriptPath,
        TEST_ARCHIVE_PATH: archivePath,
        TEST_RELEASE_ID: releaseId,
        TEST_BOT_PATH: hostileBotPath,
        TEST_FAIL_SCP: failScp ? '1' : '0',
      },
    });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    const json = result.stdout.split(/\r?\n/).filter(Boolean).at(-1);
    assert.ok(json, 'Expected the PowerShell harness to return captured calls');
    return JSON.parse(json) as HarnessResult;
  }

  function decodeRemoteCommands(calls: CapturedCall[]): string[] {
    return calls
      .filter(({ command }) => command === 'ssh')
      .map(({ arguments: args }) => {
        const encodedCommandIndex = args.indexOf('-EncodedCommand');
        assert.notEqual(encodedCommandIndex, -1, 'Expected SSH to invoke an encoded PowerShell command');
        return Buffer.from(args[encodedCommandIndex + 1], 'base64').toString('utf16le');
      });
  }

  it('uses pinned SSH options and sends secrets only through protected files', () => {
    const result = runHarness();
    assert.equal(result.succeeded, true, result.error);

    const allArguments = result.calls.flatMap(({ arguments: args }) => args);
    for (const option of ['BatchMode=yes', 'IdentitiesOnly=yes', 'StrictHostKeyChecking=yes']) {
      assert.ok(allArguments.includes(option), `Missing SSH option: ${option}`);
    }
    for (const secret of ['secret-private-key', 'secret-host-key', 'secret-discord-token']) {
      assert.doesNotMatch(allArguments.join('\n'), new RegExp(secret));
    }

    const scpCalls = result.calls.filter(({ command }) => command === 'scp');
    assert.equal(scpCalls.length, 2);
    assert.ok(scpCalls.some(({ arguments: args }) => args.at(-1)?.endsWith('/environment.env')));

    const sshCall = result.calls.find(({ command }) => command === 'ssh');
    assert.equal(sshCall?.keyHasCarriageReturn, false);
    assert.equal(sshCall?.keyEndsWithLineFeed, true);
    assert.equal(sshCall?.knownHostsHasCarriageReturn, false);
    assert.equal(sshCall?.knownHostsEndsWithLineFeed, true);

    const environmentCall = scpCalls.find(({ arguments: args }) => args.at(-1)?.endsWith('/environment.env'));
    assert.equal(
      Buffer.from(environmentCall?.environmentBase64 ?? '', 'base64').toString('utf8'),
      'DISCORD__TOKEN=secret-discord-token\r\nVALUE=unchanged',
    );
  });

  it('keeps a hostile bot path as encoded data in the actual remote command', () => {
    const result = runHarness();
    const remoteCommands = decodeRemoteCommands(result.calls);
    const deployCommand = remoteCommands.find((command) => command.includes('$deployArguments'));
    assert.ok(deployCommand, 'Expected to capture the deployment bootstrap');

    assert.doesNotMatch(deployCommand, new RegExp(hostileBotPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const encodedPath = Buffer.from(hostileBotPath, 'utf8').toString('base64');
    assert.match(deployCommand, new RegExp(`\\$botPathBase64 = '${encodedPath}'`));
    assert.match(deployCommand, /\$deployArguments\.EnvFilePath = \$environmentPath/);
  });

  it('runs remote cleanup after an SCP failure and does not invoke deployment', () => {
    const result = runHarness(true);
    assert.equal(result.succeeded, false);
    assert.match(result.error, /Could not upload the release archive \(exit code 23\)/);

    const remoteCommands = decodeRemoteCommands(result.calls);
    assert.equal(remoteCommands.length, 2, 'Expected initialization followed by cleanup');
    assert.match(remoteCommands[0], /New-Item -ItemType Directory/);
    assert.match(remoteCommands[1], /Remove-Item -LiteralPath \$stagePath -Recurse -Force/);
    assert.ok(remoteCommands.every((command) => !command.includes('$deployArguments')));
  });

  it('parses with Windows PowerShell', () => {
    const command = [
      '$tokens = $null',
      '$errors = $null',
      '[void][Management.Automation.Language.Parser]::ParseFile($env:TEST_SCRIPT_PATH, [ref]$tokens, [ref]$errors)',
      'if ($errors.Count -gt 0) { $errors | ForEach-Object { [Console]::Error.WriteLine($_.Message) }; exit 1 }',
    ].join('; ');
    const result = spawnSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command], {
      encoding: 'utf8',
      env: { ...process.env, TEST_SCRIPT_PATH: scriptPath },
    });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
  });
});
