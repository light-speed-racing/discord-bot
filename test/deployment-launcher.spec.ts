import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, it } from 'node:test';

const launcherSource = resolve(__dirname, '../scripts/windows/Run-Bot.js');
const releaseId = '0123456789012345678901234567890123456789';

function symlinkSkipReason(): string | false {
  if (process.platform !== 'win32') {
    return false;
  }

  const probeRoot = mkdtempSync(join(tmpdir(), 'discord-bot symlink probe '));
  try {
    mkdirSync(join(probeRoot, 'target'));
    symlinkSync(join(probeRoot, 'target'), join(probeRoot, 'link'), 'junction');
    return false;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EPERM' || code === 'EACCES') {
      return `Creating junctions is unavailable: ${code}`;
    }
    throw error;
  } finally {
    rmSync(probeRoot, { recursive: true, force: true });
  }
}

type Fixture = {
  botPath: string;
  deploymentPath: string;
  releasePath: string;
  launcherPath: string;
};

const fixtures: string[] = [];

function createFixture(entrypoint: string): Fixture {
  assert.equal(existsSync(launcherSource), true, `Missing deployment launcher: ${launcherSource}`);

  const botPath = realpathSync(mkdtempSync(join(tmpdir(), 'discord-bot launcher ')));
  fixtures.push(botPath);
  const deploymentPath = join(botPath, '.deployment');
  const releasePath = join(deploymentPath, 'releases', `${releaseId}-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`);
  const launcherPath = join(deploymentPath, 'run-bot.js');

  mkdirSync(join(releasePath, 'dist'), { recursive: true });
  copyFileSync(launcherSource, launcherPath);
  writeFileSync(
    join(deploymentPath, 'config.json'),
    JSON.stringify({
      botPath,
      nodePath: process.execPath,
      taskName: 'LightSpeedDiscordBot',
      healthUrl: 'http://127.0.0.1:3000/health',
    }),
  );
  writeFileSync(join(deploymentPath, 'current.json'), JSON.stringify({ releaseId, releasePath }));
  writeFileSync(join(releasePath, 'dist', 'main.js'), entrypoint);

  return { botPath, deploymentPath, releasePath, launcherPath };
}

function runLauncher(fixture: Fixture) {
  return spawnSync(process.execPath, [fixture.launcherPath, '--bot-path', fixture.botPath], {
    cwd: dirname(fixture.botPath),
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'test', DEPLOYMENT_RELEASE_ID: 'stale-release-id' },
  });
}

function combinedLogs(deploymentPath: string): string {
  const logPath = join(deploymentPath, 'logs');
  if (!existsSync(logPath)) {
    return '';
  }

  return readdirSync(logPath)
    .map((filename) => readFileSync(join(logPath, filename), 'utf8'))
    .join('\n');
}

afterEach(() => {
  while (fixtures.length > 0) {
    const fixture = fixtures.pop();
    if (fixture) {
      rmSync(fixture, { recursive: true, force: true });
    }
  }
});

describe('Windows deployment launcher', { concurrency: false }, () => {
  it('loads the selected release with its deployment identity and original working directory', () => {
    const fixture = createFixture(`
      console.log(JSON.stringify({
        cwd: process.cwd(),
        release: process.env.DEPLOYMENT_RELEASE_ID,
        instance: process.env.DEPLOYMENT_INSTANCE_ID,
        nodeEnv: process.env.NODE_ENV,
      }));
    `);

    const result = runLauncher(fixture);

    assert.equal(result.status, 0, result.stderr);
    const expected = {
      cwd: execFileSync(
        process.execPath,
        ['-e', 'console.log(require("node:fs").realpathSync(process.argv[1]))', fixture.botPath],
        {
          encoding: 'utf8',
        },
      ).trim(),
      release: releaseId,
      instance: `${releaseId}-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
      nodeEnv: 'production',
    };
    assert.match(result.stdout, new RegExp(JSON.stringify(expected).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    const logs = combinedLogs(fixture.deploymentPath);
    assert.match(logs, new RegExp(releaseId));
    assert.match(logs, new RegExp(JSON.stringify(expected).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  it('rejects an invalid release id', () => {
    const fixture = createFixture('console.log("must not run")');
    writeFileSync(
      join(fixture.deploymentPath, 'current.json'),
      JSON.stringify({ releaseId: '../not-a-release', releasePath: fixture.releasePath }),
    );

    const result = runLauncher(fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /release id|deployment pointer|invalid/i);
    assert.doesNotMatch(result.stdout, /must not run/);
  });

  it('rejects a release outside the managed releases directory', () => {
    const fixture = createFixture('console.log("must not run")');
    const outsidePath = join(fixture.botPath, 'outside');
    mkdirSync(join(outsidePath, 'dist'), { recursive: true });
    writeFileSync(join(outsidePath, 'dist', 'main.js'), 'console.log("must not run")');
    writeFileSync(
      join(fixture.deploymentPath, 'current.json'),
      JSON.stringify({ releaseId, releasePath: outsidePath }),
    );

    const result = runLauncher(fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /outside|managed release|deployment pointer|invalid/i);
    assert.doesNotMatch(result.stdout, /must not run/);
  });

  it('rejects a release without a compiled entrypoint', () => {
    const fixture = createFixture('console.log("must not run")');
    rmSync(join(fixture.releasePath, 'dist', 'main.js'));

    const result = runLauncher(fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /dist[\\/]main\.js|entrypoint|entry point|missing/i);
  });

  it('rejects a symlink that escapes the managed releases directory', { skip: symlinkSkipReason() }, () => {
    const fixture = createFixture('console.log("must not run")');
    const outsidePath = join(fixture.botPath, 'outside-release');
    const symlinkPath = join(fixture.deploymentPath, 'releases', 'linked-release');
    mkdirSync(join(outsidePath, 'dist'), { recursive: true });
    writeFileSync(join(outsidePath, 'dist', 'main.js'), 'console.log("must not run")');

    symlinkSync(outsidePath, symlinkPath, process.platform === 'win32' ? 'junction' : 'dir');

    writeFileSync(
      join(fixture.deploymentPath, 'current.json'),
      JSON.stringify({ releaseId, releasePath: symlinkPath }),
    );

    const result = runLauncher(fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /outside|managed release|deployment pointer|invalid/i);
    assert.doesNotMatch(result.stdout, /must not run/);
  });

  it('propagates the application exit status and records its error output', () => {
    const fixture = createFixture(`
      console.error('fixture application failed');
      process.exitCode = 23;
    `);

    const result = runLauncher(fixture);

    assert.equal(result.status, 23);
    assert.match(result.stderr, /fixture application failed/);
    assert.match(combinedLogs(fixture.deploymentPath), /fixture application failed/);
  });

  it('preserves the fatal exit and logs an asynchronous startup rejection', () => {
    const fixture = createFixture(`
      Promise.reject(new Error('async startup failure'));
    `);

    const result = runLauncher(fixture);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /async startup failure/);
    assert.match(combinedLogs(fixture.deploymentPath), /async startup failure/);
  });
});
