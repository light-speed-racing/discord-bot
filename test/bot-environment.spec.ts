import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { parse } from 'dotenv';
import { dotenvLoader } from 'nest-typed-config';
import { RootConfig } from '../src/config/config';
import { botSecretNames, botSettings, expectedRootConfig } from './fixtures/bot-settings';

const helperPath = path.resolve(__dirname, '../scripts/github/BotEnvironment.ps1');
const fixtureRoots: string[] = [];

function availablePowerShell(): string | undefined {
  const candidate = process.env.POWERSHELL_BINARY || (process.platform === 'win32' ? 'powershell.exe' : 'pwsh');
  const result = spawnSync(
    candidate,
    ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.ToString()'],
    { encoding: 'utf8' },
  );
  return result.status === 0 ? candidate : undefined;
}

const powerShell = availablePowerShell();

type HelperResult = {
  status: number | null;
  stdout: string;
  stderr: string;
  content: string | null;
};

function runHelper(values: Record<string, string>): HelperResult {
  assert.ok(powerShell, 'PowerShell is required to execute the environment helper');
  assert.equal(fs.existsSync(helperPath), true, `Missing environment helper: ${helperPath}`);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bot environment '));
  fixtureRoots.push(root);
  const valuesPath = path.join(root, 'values.json');
  fs.writeFileSync(valuesPath, JSON.stringify(values));

  const command = String.raw`
$valuesObject = Get-Content -LiteralPath $env:TEST_VALUES_PATH -Raw -Encoding UTF8 | ConvertFrom-Json
$values = @{}
$valuesObject.psobject.Properties | ForEach-Object { $values[$_.Name] = [string]$_.Value }
. $env:TEST_HELPER_PATH
$content = New-BotEnvironmentContent -Values $values
if ($null -eq $content) {
    [Console]::Out.Write('{"isNull":true}')
}
else {
    $base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
    [Console]::Out.Write('{"isNull":false,"contentBase64":"' + $base64 + '"}')
}`;
  const result = spawnSync(powerShell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command], {
    encoding: 'utf8',
    env: { ...process.env, TEST_VALUES_PATH: valuesPath, TEST_HELPER_PATH: helperPath },
  });

  let content: string | null = null;
  if (result.status === 0) {
    const parsed = JSON.parse(result.stdout) as { isNull: boolean; contentBase64?: string };
    content = parsed.isNull ? null : Buffer.from(parsed.contentBase64 ?? '', 'base64').toString('utf8');
  }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, content };
}

afterEach(() => {
  while (fixtureRoots.length > 0) {
    const fixtureRoot = fixtureRoots.pop();
    if (fixtureRoot) {
      fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }
});

describe('bot environment serializer', { skip: powerShell ? false : 'PowerShell unavailable' }, () => {
  it('returns null when every optional bot setting is absent', () => {
    const result = runHelper({});

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.content, null);
  });

  it('returns null when every bot setting is an empty string', () => {
    const values = Object.fromEntries(botSecretNames.map((name) => [name, '']));
    const result = runHelper(values);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.content, null);
  });

  it('ignores the retired BOT_ENV_FILE setting', () => {
    const result = runHelper({ BOT_ENV_FILE: 'legacy-secret-blob' });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.content, null);
  });

  it('round-trips every setting into the validated RootConfig shape', () => {
    const result = runHelper(botSettings);

    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.content);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bot environment parsed '));
    fixtureRoots.push(root);
    const envPath = path.join(root, 'environment.env');
    fs.writeFileSync(envPath, result.content);

    const loaded = dotenvLoader({ envFilePath: envPath, ignoreEnvVars: true, separator: '__' })();
    const config = plainToInstance(RootConfig, loaded);

    assert.deepEqual(config, plainToInstance(RootConfig, expectedRootConfig));
    assert.deepEqual(validateSync(config), []);
  });

  it('reports only missing setting names when configuration is partial', () => {
    const suppliedName = botSecretNames[0];
    const suppliedValue = 'must-not-appear-in-errors';
    const result = runHelper({ [suppliedName]: suppliedValue });

    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stderr, new RegExp(suppliedValue));
    assert.doesNotMatch(result.stderr, new RegExp(suppliedName));
    for (const missingName of botSecretNames.slice(1)) {
      assert.match(result.stderr, new RegExp(missingName));
    }
  });

  it('treats a whitespace-only supplied setting as missing', () => {
    const result = runHelper({ BOT_PORT: '   ' });

    assert.notEqual(result.status, 0);
    for (const missingName of botSecretNames) {
      assert.match(result.stderr, new RegExp(missingName));
    }
  });

  it('preserves literal backslash-n and backslash-r when double quotes are otherwise available', () => {
    const value = "apostrophe' literal\\n literal\\r";
    const result = runHelper({ ...botSettings, DISCORD_TOKEN: value });

    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.content);
    assert.equal(parse(result.content).discord__token, value);
  });

  for (const [description, invalidValue] of [
    ['carriage returns', 'secret\rvalue'],
    ['line feeds', 'secret\nvalue'],
    ['NUL characters', 'secret\0value'],
    ['values containing every supported delimiter', `secret'"\`value`],
  ] as const) {
    it(`rejects ${description} without leaking the value`, () => {
      const values = { ...botSettings, DISCORD_TOKEN: invalidValue };
      const result = runHelper(values);

      assert.notEqual(result.status, 0);
      assert.equal(result.stderr.includes(invalidValue), false);
      assert.match(result.stderr, /DISCORD_TOKEN/);
    });
  }
});
