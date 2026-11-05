# Windows deployment

The **Deploy Windows bot** workflow runs on pushes to `master` and from **Run workflow**
on `master`. Both paths test, typecheck, and build the same Windows release before
deploying it. Pull requests run the same verification without deployment secrets.

Deployment is initially disabled. Set the **repository variable**
`WINDOWS_DEPLOY_ENABLED=true` only after completing the setup and first cutover below.
Nothing in this repository automatically provisions or changes your server.

## How it runs

- GitHub-hosted Windows runners build a ZIP containing compiled code, the locked
  dependency manifest, and deployment scripts. The ZIP contains no `.env` or SSH keys.
- SSH uploads that ZIP to a temporary folder on the server. The server installs
  production dependencies into a new, immutable release directory before stopping
  the current bot.
- A named Windows Scheduled Task runs the bot after boot, even when you log out.
  It uses Node directly, runs with limited privileges, and restarts after failures.
- The launcher loads `.deployment/current.json` but keeps the original bot folder
  as its working directory. Your existing checkout and `.env` stay in place.
- Deployment stops only that task, selects the new release, and checks `/health`
  for `status: "ok"`, the expected `deploymentReleaseId`, and a unique
  `deploymentInstanceId`. A previous deployment of the same commit cannot satisfy
  the new instance check.
- If startup fails, deployment restores the previous release, launcher, and any
  `.env` it replaced. On the first deployment there is no previous managed release;
  failure leaves the task stopped and the original checkout available for recovery.

There is a brief interruption during restart. The workflow serializes deployments;
the server also holds a file lock. Old releases and logs are retained for inspection.
The launcher is the app process itself, so stopping the task does not leave a child bot.

## 1. Prepare the server once

Use Remote Desktop and an elevated **Windows PowerShell** session for setup.
The new task needs Node.js 26 LTS to match CI; deployment accepts Node 24 or newer.
Keep an older global Node installation intact if the server already uses it for
other programs. A portable, side-by-side Node installation is supported through
setup's `-NodePath` parameter. Yarn Classic 1.22.x must be available to the SSH
account as `yarn.cmd` without Git Bash; the existing standalone Windows Yarn
installation can be reused. CI uses Yarn 1.22.22.

```powershell
node.exe --version
yarn.cmd --version
```

For a side-by-side installation, download the official Windows x64 ZIP and verify
its published checksum before extracting it under the bot's managed tools folder.
This example leaves global Node and `PATH` unchanged:

```powershell
$botPath = 'C:\Users\your-user\Desktop\discord-bot'
$nodeVersion = '26.13.0'
$archiveName = "node-v$nodeVersion-win-x64.zip"
$baseUrl = "https://nodejs.org/dist/v$nodeVersion"
$toolsPath = Join-Path $botPath '.deployment\tools'
$nodeDirectory = Join-Path $toolsPath "node-v$nodeVersion-win-x64"
if (Test-Path -LiteralPath $nodeDirectory) { throw 'This runtime directory already exists; inspect it before reuse.' }
$downloadPath = Join-Path $env:TEMP ("bot-runtime-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $downloadPath -Force | Out-Null
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $archivePath = Join-Path $downloadPath $archiveName
    Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/$archiveName" -OutFile $archivePath
    $checksums = (Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/SHASUMS256.txt").Content
    $checksumLine = @($checksums -split "`n" | Where-Object { $_.Trim().EndsWith(" $archiveName") })
    if ($checksumLine.Count -ne 1) { throw 'The published archive checksum was not found.' }
    $expected = ($checksumLine[0] -split '\s+')[0]
    if ((Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -ne $expected) { throw 'Node archive checksum mismatch.' }
    Expand-Archive -LiteralPath $archivePath -DestinationPath $downloadPath
    New-Item -ItemType Directory -Path $toolsPath -Force | Out-Null
    Move-Item -LiteralPath (Join-Path $downloadPath "node-v$nodeVersion-win-x64") -Destination $toolsPath
}
finally {
    Remove-Item -LiteralPath $downloadPath -Recurse -Force
}
$nodePath = Join-Path $nodeDirectory 'node.exe'
& $nodePath --version
```

Use that absolute `$nodePath` for task setup. Deployment temporarily uses its
directory first in `PATH` while installing dependencies, then restores `PATH`.
If Yarn is missing, install Yarn Classic as a separate setup step; a standalone
Yarn launcher that invokes `node` from `PATH` supports this arrangement.

Keep the existing bot folder and `.env`. Determine the bot's configured HTTP port;
the setup URL below must use that port. `/health` checks the database, Open Game Panel,
and internet connectivity, so all three must work under the task's account.

### SSH access

If Windows OpenSSH Server is not installed, these are the standard administrator
commands. Use the server's intended SSH port and firewall rules; the workflow does
not change them.

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

Create a dedicated deployment SSH key on your Mac, outside this checkout:

```sh
ssh-keygen -t ed25519 -C github-actions-discord-bot -f ~/.ssh/discord-bot-actions
```

The workflow uses unattended key authentication, so this dedicated key must have
no passphrase. Keep its private key for `SSH_KEY`; install only the `.pub` contents
on the Windows server. The transport supports a local Windows username, DNS/IPv4
host, and configurable SSH port.

For an account in the local Administrators group, OpenSSH uses
`C:\ProgramData\ssh\administrators_authorized_keys`. Append the public key without
removing existing keys. Remove inherited permissions and allow Administrators and
SYSTEM, as required by Windows OpenSSH:

```powershell
$keyFile = 'C:\ProgramData\ssh\administrators_authorized_keys'
if (-not (Test-Path -LiteralPath $keyFile)) {
    New-Item -ItemType File -Path $keyFile | Out-Null
}
# Append the complete ssh-ed25519 public key line using your editor.
icacls.exe $keyFile /inheritance:r /grant:r '*S-1-5-32-544:F' '*S-1-5-18:F'
icacls.exe $keyFile
```

Verify there are no other explicit permissions on that key file. For a non-admin
SSH user, follow Microsoft's per-user `authorized_keys` setup instead.

Obtain the server's public host key through this trusted Remote Desktop session:

```powershell
Get-Content 'C:\ProgramData\ssh\ssh_host_ed25519_key.pub'
ssh-keygen.exe -lf 'C:\ProgramData\ssh\ssh_host_ed25519_key.pub'
```

Construct a `known_hosts` line using the hostname or IP the workflow will connect to:

```text
your-server.example ssh-ed25519 AAAA...the-server-public-host-key...
```

For a port other than 22, use `[your-server.example]:2222` as the first field.
Save this verified line as `SSH_KNOWN_HOSTS`. The workflow does not accept host keys
discovered during deployment. It explicitly invokes Windows PowerShell over SSH;
there is no need to change OpenSSH's machine-wide default shell.

### Register the background task

Copy `scripts/windows` from this reviewed version to a setup folder on the server.
Run the setup script, adjusting the original checkout path and health port:

```powershell
.\Setup-BotTask.ps1 `
    -BotPath 'C:\Users\your-user\Desktop\discord-bot' `
    -HealthUrl 'http://127.0.0.1:3000/health' `
    -NodePath $nodePath
```

The script prompts for the Windows account and password that will run the task.
Windows Task Scheduler stores these credentials; they are not written to GitHub
or deployment configuration. Choose an account that can read the bot's `.env` and
release files, write its logs, and reach the database and APIs. Its local/domain
policy must allow batch logon. An account/password change requires updating the task.
For an unattended setup, an existing in-memory `PSCredential` can be supplied with
`-Credential`. Keep its password out of command-line arguments and script files.

The default task name is `LightSpeedDiscordBot`; `-TaskName` and `-NodePath` are
available for deliberate overrides. Setup registers the task but does not start
it or stop the existing Git Bash process. Do not overwrite an unrelated task with
the same name.

## 2. Configure GitHub

Create an environment named **production** under repository **Settings → Environments**.
Restrict its deployment branch to `master`. An optional required-reviewer rule can
add an approval before either trigger deploys.

Add these **production environment secrets**:

| Secret            | Value                                                                         |
| ----------------- | ----------------------------------------------------------------------------- |
| `PATTY_HOST`      | Server DNS name or IPv4 address                                               |
| `PATTY_USERNAME`  | Local Windows SSH username                                                    |
| `PATTY_PORT`      | SSH port; optional, defaults to `22`                                          |
| `SSH_KEY`         | Complete dedicated private key, including BEGIN/END lines; not the public key |
| `SSH_KNOWN_HOSTS` | Verified host-key line obtained above                                         |

Set the **production environment variable** `WINDOWS_BOT_PATH` to the absolute
original bot folder, for example `C:\Users\your-user\Desktop\discord-bot`.

### Writing `.env` from individual GitHub secrets

Add each application setting as its own **production environment secret**, using
the names below. Copy each value from the corresponding production setting; do not
include surrounding `.env` quotes in the GitHub secret value. The workflow writes
the exact nested key names and letter case expected by the application's loader.

| GitHub secret                        | Generated `.env` key                                      |
| ------------------------------------ | --------------------------------------------------------- |
| `BOT_PORT`                           | `port` — currently `3000`, matching the task's health URL |
| `DISCORD_TOKEN`                      | `discord__token`                                          |
| `DISCORD__GUILD_ID`                  | `discord__guild_id`                                       |
| `DISCORD__LOGGING_CHANNEL_ID`        | `discord__logging_channel_id`                             |
| `DISCORD__WEATHER_UPDATE_CHANNEL_ID` | `discord__weather_update_channel_id`                      |
| `DATABASE__HOST`                     | `database__host`                                          |
| `DATABASE__PORT`                     | `database__port`                                          |
| `DATABASE__USERNAME`                 | `database__username`                                      |
| `DATABASE__PASSWORD`                 | `database__password`                                      |
| `DATABASE__DATABASE_NAME`            | `database__database_name`                                 |
| `GIPHY__APIKEY`                      | `giphy__apiKey`                                           |
| `SIMGRID__URL`                       | `simgrid__url`                                            |
| `SIMGRID__TOKEN`                     | `simgrid__token`                                          |
| `OPENGAMEPANEL__IP`                  | `openGamePanel__ip`                                       |
| `OPENGAMEPANEL__API_TOKEN`           | `openGamePanel__api_token`                                |
| `OPENGAMEPANEL__AUTHORIZATION_TOKEN` | `openGamePanel__authorization_token`                      |
| `OPENWEATHERAPI__TOKEN`              | `openWeatherApi__token`                                   |
| `OPENAI__APIKEY`                     | `openai__apiKey`                                          |

The generated file also sets `env=production`. All 18 settings must be present and
nonblank when using GitHub-managed configuration. A partial set fails before any
SSH connection or server change, reporting only missing secret names. If all 18
are unset, deployment preserves the server's existing `.env`.

Values are single-line strings. The serializer preserves spaces, hashes, dollar
signs, backslashes, and quotes using a compatible `.env` delimiter. Line breaks,
NUL characters, and quote combinations that the installed dotenv parser cannot
represent safely are rejected before deployment, without printing the value.

The transport uploads the generated file separately over SSH to a protected
temporary folder. Deployment backs up the previous `.env`, replaces it only while
the task is stopped, and restricts access to the task account, Administrators, and
SYSTEM. A failed deployment restores the previous file and permissions along with
the previous application. Successful deployment removes the temporary backup.

The former `BOT_ENV_FILE` secret is no longer used and can be removed. Removing all
application secrets later does not remove the server's deployed `.env`. Keep
`BOT_PORT` aligned with the task's health URL. Secret changes take effect on the
next deployment; you can rerun the manual workflow for the same commit.

The secret file is never included in the downloadable build artifact. Workflow
output does not print its contents. Application logs still follow the application's
own logging behavior, so do not add secret values to application logs.

## 3. First cutover

After the workflow and scripts are reviewed, committed, and available on `master`:

1. Keep `WINDOWS_DEPLOY_ENABLED` unset or `false` while completing SSH and task setup.
2. In the server's existing Git Bash bot terminal, stop the original bot with **Ctrl+C**.
   Do not start a second interactive instance alongside the task.
3. Set the **repository variable** `WINDOWS_DEPLOY_ENABLED` to `true`. It must be a
   repository variable because deployment eligibility is checked before entering
   the production environment.
4. Open **Actions → Deploy Windows bot → Run workflow**, select `master`, and run it.
5. Confirm the workflow succeeds and `Get-ScheduledTask -TaskName LightSpeedDiscordBot`
   reports `Running`. Check the bot's Discord connection and expected behavior.

Subsequent pushes to `master` deploy automatically after the same checks. Manual runs
on other branches do not deploy. Use the manual trigger to retry or apply updated
environment secrets without a new commit. New release directories are immutable,
including when redeploying the same commit.

## Logs, rollback, and recovery

Under the original bot folder:

| Path                       | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `.deployment/config.json`  | Task, Node, bot path, and health URL configuration              |
| `.deployment/current.json` | Current commit ID and selected immutable release path           |
| `.deployment/releases/`    | Retained application releases and their production dependencies |
| `.deployment/logs/`        | Dated application stdout/stderr logs containing the release ID  |
| `.deployment/env-backups/` | Protected recovery files if environment rollback cannot finish  |

The entire `.deployment` directory is ignored by Git. Do not upload these logs or
recovery files publicly without checking them for sensitive application output.

If installation fails, the existing task is left running. If restart or health fails,
the deployment attempts rollback and the workflow fails. Check the task's **Last Run
Result**, `.deployment/current.json`, and the dated log file through Remote Desktop.
If rollback itself fails, disable deployments with `WINDOWS_DEPLOY_ENABLED=false`
and preserve the retained release and environment backup for recovery.

If the very first deployment fails, check that the managed task is stopped before
temporarily restarting the untouched original checkout using your previous Git Bash
command. Once a managed release has succeeded, use task controls rather than running
an additional bot process:

```powershell
Stop-ScheduledTask -TaskName LightSpeedDiscordBot
Start-ScheduledTask -TaskName LightSpeedDiscordBot
```

## Validation scope

`npm test` includes TypeScript launcher, health identity, and deployment tests.
The individual-secret serializer tests round-trip the generated file through the
installed dotenv loader and validate the complete application configuration.
These tests require PowerShell; on macOS/Linux, set `POWERSHELL_BINARY` to a
portable `pwsh` executable to run them locally. Windows CI supplies PowerShell 5.1.
Windows-specific task/ACL transaction tests and the Windows PowerShell 5.1 parser
run in the Windows verification workflow. Local macOS tests cannot establish that
SSH, scheduled-task account policy, server permissions, production credentials,
or a real cutover work. Those require the first server deployment above.

Official references: [GitHub secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets),
[deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments),
[Windows OpenSSH configuration](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-server-configuration),
[task logon types](https://learn.microsoft.com/en-us/windows/win32/taskschd/principal-logontype),
[Node release status](https://nodejs.org/en/about/previous-releases).
