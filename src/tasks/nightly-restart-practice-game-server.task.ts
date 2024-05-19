import { Injectable } from '@nestjs/common';
import { AbstractScheduler } from './abstract-scheduler';
import { CronExpression } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EventJSON, SettingsJSON, Track } from 'src/assetto-corsa-competizione.types';
import { BopProvider, GameServer } from 'src/database/game-server.entity';
import { WeatherService } from 'src/common/weather.service';
import { SimgridService } from 'src/simgrid/simgrid.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { TextChannel, codeBlock } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

@Injectable()
export class NightlyRestartPracticeGameServerTask extends AbstractScheduler {
  name = `${NightlyRestartPracticeGameServerTask.name}-with-serverType-PRACTICE`;
  timeExpression: string = CronExpression.EVERY_DAY_AT_7AM;

  constructor(
    private readonly gameServer: GameServerService,
    private readonly gameManager: GameManager,
    private readonly fileManager: FileManager,
    private readonly bop: BalanceOfPerformanceService,
    private readonly weather: WeatherService,
    private readonly simgrid: SimgridService,
    private readonly channel: DiscordChannelService,
  ) {
    super();
  }

  run = async () => {
    await this.channel.log('Nightly restart task has started');
    const servers = await this.gameServer.getServersThatShouldHaveARestartJob('practice');

    for (const server of servers) {
      await this.channel.log(`[**${server.home_name}**]: Starting...`);
      const { bop_provider } = server.custom_fields;

      const eventJson = await this.fileManager.read<EventJSON>('event.json', server);

      await this.gameServer.updateConfigurationJson(server);

      await this.updateEvent(server);

      await this.updateBop(eventJson.track, bop_provider, server);

      await this.gameManager.restart(server);

      if (server.custom_fields.channel_id) {
        await this.notifyChannel(server);
      }

      await this.sendWeatherUpdate(server);

      await this.channel.log(`[**${server.home_name}**]: Finished...`);
    }
  };

  private notifyChannel = async ({ custom_fields, home_name }: GameServer) => {
    return await this.channel
      .find<TextChannel>(custom_fields.channel_id)
      .send(`Server ${home_name} has been restarted and the weather has been updated`);
  };

  private sendWeatherUpdate = async (server: GameServer) => {
    const eventJson = await this.fileManager.read<EventJSON>('event.json', server);
    const settingsJson = await this.fileManager.read<SettingsJSON>('settings.json', server);

    return this.channel.weatherUpdate({
      embeds: [
        new EmbedBuilder({
          title: `Weather forecast for **${settingsJson.serverName}**`,
          description: `As of **3 pm** localtime today at **${eventJson.track.toUpperCase()}** the forecast is...

          **Please note** that these parameters is used to run a race weekend simulation. The actual weather might differ...
          Read more about the [race weekend simulation](https://www.acc-wiki.info/wiki/Multiplayer_Overview#Race_weekend)
          
          Data is provided by [openweathermap.org](https://openweathermap.org/)`,
          fields: [
            { name: '🏎️ Track', value: `${eventJson.track.toUpperCase()}` },
            { name: '🌡️ Ambient temp.', value: `${eventJson.ambientTemp}°C` },
            { name: '☁️ Cloud level', value: `${Number(eventJson.cloudLevel * 100).toFixed(2)}%` },
            { name: '🌧️ Rain', value: `${Number(eventJson.rain * 100).toFixed(2)}%` },
            { name: 'Weather randomness', value: `${eventJson.weatherRandomness}` },
          ],
        }),
      ],
    });
  };

  private updateEvent = async (server: GameServer) => {
    const content = await this.gameServer.updateEventJson(server);

    await this.channel.log(`[**${server.home_name}**]: event.json was updated...`);
    await this.channel.log(codeBlock(JSON.stringify(content)));

    return content;
  };

  private updateBop = async (track: Track, provider: BopProvider, server: GameServer) => {
    const { entries } = await this.bop.fetch(provider);
    const content = { entries: entries?.filter((entry) => entry.track === track) };
    await this.fileManager.write('bop.json', content, server);
    await this.channel.log(`[**${server.home_name}**]: bop.json was updated...`);
    return content;
  };
}
