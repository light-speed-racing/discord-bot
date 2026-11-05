import assert from 'node:assert/strict';
import { spawnSync, SpawnSyncReturns } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { expectedEnvironmentValues } from './fixtures/bot-settings';

const repositoryRoot = path.resolve(__dirname, '..');
const configModulePath = path.join(repositoryRoot, 'src/config/config.module.ts');
const reflectMetadataPath = require.resolve('reflect-metadata');
const tsNodeRegisterPath = require.resolve('ts-node/register');
const tsconfigPath = path.join(repositoryRoot, 'tsconfig.json');
const legacyPackageNames = ['class-transformer', 'class-validator', 'libphonenumber-js', 'validator'];
const fixtureRoots: string[] = [];

const deploymentSettings = Object.fromEntries(
  Object.keys(expectedEnvironmentValues).map((name, index) => [name, `deployment-value-${index}`]),
);
deploymentSettings.port = '4321';
deploymentSettings.database__port = '3306';

function createLegacyWorkingDirectory(settings: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'discord bot legacy cwd '));
  fixtureRoots.push(root);
  const legacyModulesPath = path.join(root, 'node_modules');
  fs.mkdirSync(legacyModulesPath, { recursive: true });
  for (const packageName of legacyPackageNames) {
    const source = path.dirname(require.resolve(`${packageName}/package.json`));
    fs.cpSync(source, path.join(legacyModulesPath, packageName), { recursive: true });
  }
  fs.writeFileSync(
    path.join(root, '.env'),
    Object.entries(settings)
      .map(([name, value]) => `${name}=${JSON.stringify(value)}`)
      .join('\n'),
  );
  return root;
}

function loadConfigFromLegacyWorkingDirectory(settings: Record<string, string>): SpawnSyncReturns<string> {
  const cwd = createLegacyWorkingDirectory(settings);
  const configuredNames = new Set(Object.keys(expectedEnvironmentValues).map((name) => name.toLowerCase()));
  const cleanEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !configuredNames.has(name.toLowerCase())),
  );
  const script = `
const { rootConfig } = require(process.env.TEST_CONFIG_MODULE_PATH);
if (typeof rootConfig.port !== 'number') throw new Error('port was not converted to a number');
if (rootConfig.discord?.constructor?.name !== 'DiscordConfig') throw new Error('discord was not converted');
if (rootConfig.database?.constructor?.name !== 'DatabaseConfig') throw new Error('database was not converted');
process.stdout.write(JSON.stringify({ port: rootConfig.port, databasePort: rootConfig.database.port }));
`;

  return spawnSync(
    process.execPath,
    ['--require', reflectMetadataPath, '--require', tsNodeRegisterPath, '--eval', script],
    {
      cwd,
      encoding: 'utf8',
      env: {
        ...cleanEnvironment,
        TS_NODE_PROJECT: tsconfigPath,
        TEST_CONFIG_MODULE_PATH: configModulePath,
      },
    },
  );
}

afterEach(() => {
  while (fixtureRoots.length > 0) {
    const fixtureRoot = fixtureRoots.pop();
    if (fixtureRoot) fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

describe('ConfigModule deployment isolation', () => {
  it('uses release-local transformation metadata when the working directory has another class-transformer', () => {
    const result = loadConfigFromLegacyWorkingDirectory(deploymentSettings);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { port: 4321, databasePort: 3306 });
  });

  it('rejects invalid numeric configuration without including secret values', () => {
    const invalidPort = 'sensitive-invalid-port-value';
    const settings = { ...deploymentSettings, port: invalidPort };
    const result = loadConfigFromLegacyWorkingDirectory(settings);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.notEqual(result.status, 0);
    assert.match(output, /port must be a number/);
    for (const value of Object.values(settings)) {
      assert.equal(output.includes(value), false);
    }
  });
});
