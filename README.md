![Light Speed Racing loved Discord](./docs/light-speed-racing-loves-discord.png)

# discord-bot
This is the discord bot that is running the Light Speed Racing discord server.

The idea beghind this bot is to make every day live easier.

### What text is used
This bot is build using [nestjs](https://nestjs.com/), [fjodor-rybakov/discord-nestjs](https://github.com/fjodor-rybakov/discord-nestjs), [typeorm](https://typeorm.io/) with [@netsjs/typeorm](https://docs.nestjs.com/techniques/database)

### Local development
Start by copying the `template.env.json` to `.evn.json` and set update your own `discord token` and `guild id`. The database credentials that already is in the files matches the one configured for docker.

In your terminal type
```sh
  mv template.env.json env.json
```
**Note:** Make sure to update the discord token and discord guild id to your development discord server.

To start developing you should have the latest version of docker running. To boot up the docker container you can use the yarn command `yarn docker:up`. This will start the container as a deamon.

To stop the container use `yarn docker:down`

### Database
We use a postgres database. For ORM we're using typeorm.

**Note:** Please make sure to update the `orm.config.ts` to match your env file

##### Where should things be put
Entities should be places inside the directory of the module. If you have a module names `xyz` you would the entity in that folder and call it `xyz.entity.ts`.

###### Create a migration
To generate the migration run `yarn typeorm:make create-xyz-table` and the migration will be created.

###### Run a migration
If you have migrations that has not been added to your database all of these will be run this script.
`yarn typeorm:run`

###### Rollingback a migration
All migrations is run in steps. This means if you want to rollback/revert a migration it will only revert the most current migration you've ran
`yarn typeorm:revert`

