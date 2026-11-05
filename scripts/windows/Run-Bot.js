'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function isPathInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const botPathArgument = argumentValue('--bot-path');
if (!botPathArgument) {
  fail('Missing required --bot-path argument');
}

let botPath;
try {
  botPath = fs.realpathSync(botPathArgument);
} catch (error) {
  fail(`Unable to resolve bot path: ${error.message}`);
}

const deploymentPath = path.join(botPath, '.deployment');
const releasesPath = path.join(deploymentPath, 'releases');
const currentPath = path.join(deploymentPath, 'current.json');
const logsPath = path.join(deploymentPath, 'logs');

let current;
try {
  if (fs.lstatSync(deploymentPath).isSymbolicLink() || fs.lstatSync(currentPath).isSymbolicLink()) {
    fail('Active release pointer is invalid or uses a symbolic link');
  }
  current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
} catch (error) {
  fail(`Unable to read active release pointer: ${error.message}`);
}

if (!current || !/^[0-9a-f]{40}$/.test(current.releaseId) || typeof current.releasePath !== 'string') {
  fail('Active release pointer is invalid');
}

let realReleasesPath;
let releasePath;
try {
  if (fs.lstatSync(releasesPath).isSymbolicLink() || fs.lstatSync(current.releasePath).isSymbolicLink()) {
    fail('Active release pointer is invalid or uses a symbolic link');
  }
  realReleasesPath = fs.realpathSync(releasesPath);
  releasePath = fs.realpathSync(current.releasePath);
} catch (error) {
  fail(`Unable to resolve active release: ${error.message}`);
}

const releaseDirectoryPattern = new RegExp(`^${current.releaseId}(?:-[0-9a-f]{32})?$`);
const deploymentInstanceId = path.basename(releasePath);
if (
  !isPathInside(realReleasesPath, releasePath) ||
  !releaseDirectoryPattern.test(deploymentInstanceId) ||
  !path.isAbsolute(current.releasePath)
) {
  fail('Active release pointer is invalid or outside the managed releases directory');
}

const distPath = path.join(releasePath, 'dist');
const mainPath = path.join(distPath, 'main.js');
if (!fs.existsSync(mainPath) || fs.lstatSync(distPath).isSymbolicLink() || fs.lstatSync(mainPath).isSymbolicLink()) {
  fail('Active release does not contain a valid dist/main.js');
}

try {
  if (fs.existsSync(logsPath) && fs.lstatSync(logsPath).isSymbolicLink()) {
    fail('Deployment log directory is invalid or uses a symbolic link');
  }
  fs.mkdirSync(logsPath, { recursive: true });
  if (!isPathInside(fs.realpathSync(deploymentPath), fs.realpathSync(logsPath))) {
    fail('Deployment log directory is outside the managed deployment directory');
  }
} catch (error) {
  fail(`Unable to prepare deployment log directory: ${error.message}`);
}
const date = new Date().toISOString().slice(0, 10);
const logPath = path.join(logsPath, `${date}-${current.releaseId}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

process.on('uncaughtExceptionMonitor', (error) => {
  fs.appendFileSync(logPath, `${error.stack || error}\n`);
});

function tee(stream) {
  const originalWrite = stream.write.bind(stream);
  stream.write = function write(chunk, encoding, callback) {
    logStream.write(chunk, encoding);
    return originalWrite(chunk, encoding, callback);
  };
}

tee(process.stdout);
tee(process.stderr);

process.chdir(botPath);
process.env.NODE_ENV = 'production';
process.env.DEPLOYMENT_RELEASE_ID = current.releaseId;
process.env.DEPLOYMENT_INSTANCE_ID = deploymentInstanceId;
process.stdout.write(`[deployment] Starting release ${current.releaseId} from ${releasePath}\n`);

try {
  require(mainPath);
} catch (error) {
  process.stderr.write(`${error.stack || error}\n`);
  logStream.end(() => process.exit(1));
}
