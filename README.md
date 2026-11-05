![Light Speed Racing loved Discord](./docs/light-speed-racing-loves-discord.png)

# discord-bot

This is the discord bot that is running the Light Speed Racing discord server.

The idea beghind this bot is to make every day live easier.

This bot is build using [nestjs](https://nestjs.com/), [fjodor-rybakov/discord-nestjs](https://github.com/fjodor-rybakov/discord-nestjs), [typeorm](https://typeorm.io/) with [@netsjs/typeorm](https://docs.nestjs.com/techniques/database)

### Windows deployment

Pushes to `master` and the **Deploy Windows bot** workflow's **Run workflow** button
use the same checked release and deployment process. Follow the
[Windows setup and deployment guide](docs/windows-deployment.md) to configure SSH,
the background task, GitHub secrets, and the first cutover. Deployment stays disabled
until the repository variable `WINDOWS_DEPLOY_ENABLED` is set to `true`.

### Service tests

Run `npm test` to execute the TypeScript service suites in `test/*.spec.ts`.
They use Node's test runner with the existing `ts-node` and `tsconfig-paths`
loaders. No additional test dependencies are required.

The suites follow [NestJS's isolated unit-testing approach](https://docs.nestjs.com/fundamentals/testing#unit-testing): create a fresh service
with mocked dependencies, exercise its public methods, and check results,
dependency calls, and error paths. They do not load `.env` or connect to live
HTTP APIs, Discord, or the database. Nest module wiring and live integrations
are outside these unit suites.

To run a single suite:

```sh
node --require ts-node/register --require tsconfig-paths/register --test test/simgrid.service.spec.ts
```

Run `npx tsc --noEmit --incremental false` to typecheck application code and tests.

### Balance of performance

Servers with `bop_provider` set to `lfm` receive the contents of `src/data/acc-lfm-bop.json` from `/webhooks/bop`. No LFM API credentials are needed. Update this file and rebuild/redeploy the bot to change the BOP data. The `kunos` option or an unset provider returns `{}`.

### Local development

Start by copying the `template.env.json` to `.evn.json` and set update your own `discord token` and `guild id`. The database credentials that already is in the files matches the one configured for docker.

In your terminal type

```sh
  mv template.env.json .env.json
```

**Note:** Make sure to update the discord token and discord guild id to your development discord server.
