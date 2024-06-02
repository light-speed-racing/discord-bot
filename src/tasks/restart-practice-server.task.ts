import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { ServerTaskManager } from './server-task.manager';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { EmbedBuilder } from '@discordjs/builders';
import { EventJSON, SettingsJSON } from 'src/assetto-corsa-competizione.types';

@Injectable()
export class RestartPracticeServersTask implements OnApplicationBootstrap {
  private readonly logger = new Logger(RestartPracticeServersTask.name);

  constructor(
    private readonly gameServer: GameServerService,
    private readonly gameManager: GameManager,
    private readonly manager: ServerTaskManager,
    private readonly filemanager: FileManager,
    private readonly discord: DiscordChannelService,
  ) {}

  onApplicationBootstrap() {
    this.handle();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handle() {
    const servers = await this.gameServer.serverByType('practice');

    for (const server of servers) {
      try {
        this.logger.verbose(`[${server.home_id}] ${server.home_name}: Processing....`);
        await this.manager.configuration(server);
        const event = await this.manager.event(server);
        await this.manager.eventRules(server);
        await this.manager.assistRules(server);
        const { serverName } = await this.filemanager.read<SettingsJSON>('settings.json', server);
        this.discord.log(`Restarted server: ${server.home_name}`);
        const result = await this.gameManager.restart(server);

        await this.sendWeatherUpdate(serverName, event.data);
        this.logger.verbose(serverName, result);
      } catch (error) {
        console.log(error);
      }
    }
  }

  private sendWeatherUpdate = async (serverName: string, event: EventJSON) => {
    return this.discord.weatherUpdate({
      embeds: [
        new EmbedBuilder({
          title: `Weather forecast for **${serverName}**`,
          description: `As of **3 pm** localtime today at **${event.track.toUpperCase()}** the forecast is...

          **Please note** that these parameters is used to run a race weekend simulation. The actual weather might differ...
          Read more about the [race weekend simulation](https://www.acc-wiki.info/wiki/Multiplayer_Overview#Race_weekend)
          
          Data is provided by [openweathermap.org](https://openweathermap.org/)`,
          fields: [
            { name: '🏎️ Track', value: `${event.track.toUpperCase()}`, inline: true },
            { name: '🌡️ Ambient temp.', value: `${event.ambientTemp}°C`, inline: true },
            { name: '☁️ Cloud level', value: `${Number(event.cloudLevel * 100).toFixed(0)}%`, inline: true },
            { name: '🌧️ Rain', value: `${Number(event.rain * 100).toFixed(0)}%`, inline: true },
            { name: 'Weather randomness', value: `${event.weatherRandomness}`, inline: true },
          ],
        }),
      ],
    });
  };
}
