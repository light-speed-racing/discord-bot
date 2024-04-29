import { Injectable } from '@nestjs/common';
import { AbstractScheduler } from './abstract-scheduler';
import { CronExpression } from '@nestjs/schedule';
import { GameServerService } from 'src/open-game-panel/game-server.service';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EventJSON, Track } from 'src/assetto-corsa-competizione.types';
import { BopProvider, GameServer } from 'src/database/game-server.entity';
import { WeatherService } from 'src/common/weather.service';
import { SimgridService } from 'src/simgrid/simgrid.service';
import { GameManager } from 'src/open-game-panel/game-manager.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';
import { TextChannel, codeBlock } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';

@Injectable()
export class NightlyRestartGameServerTask extends AbstractScheduler {
  public name = `${NightlyRestartGameServerTask.name}-with-serverType-PRACTICE`;
  public timeExpression: string = CronExpression.EVERY_DAY_AT_3AM;

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
      await this.updateBop(eventJson.track, bop_provider, server);
      const event = await this.updateEvent(server, eventJson);
      await this.gameManager.restart(server);
      await this.channel.log(`[**${server.home_name}**]: Finished...`);

      if (server.custom_fields.channel_id) {
        return this.channel.find<TextChannel>(server.custom_fields.channel_id).send({
          embeds: [
            new EmbedBuilder({
              title: 'Server Restarted',
              description: `Server ${server.home_name} has been restarted and the weather has been updated`,
              fields: [
                { name: 'Track', value: `${event.track}` },
                { name: 'Ambient temp.', value: `${event.ambientTemp}°C`, inline: true },
                { name: 'Cloud level', value: `${event.cloudLevel * 100}%`, inline: true },
                { name: 'Rain', value: `${event.rain * 100}%`, inline: true },
                { name: 'Weather randomness', value: `${event.weatherRandomness}`, inline: true },
              ],
              footer: { text: 'Note: these numbers is parameters to run a race weekend simulations' },
            }),
          ],
        });
      }
    }
  };

  updateEvent = async (server: GameServer, currentConfig: EventJSON) => {
    const { in_game_name } = await this.simgrid.nextRaceOfChampionship(server.custom_fields.simgrid_id);

    const weather = await this.weather.forecastFor(in_game_name);
    const content = {
      ...currentConfig,
      ...weather.at('15:00'),
      track: in_game_name,
    };
    await this.fileManager.write('event.json', content, server);

    await this.channel.log(`[**${server.home_name}**]: event.json was updated...`);
    await this.channel.log(codeBlock(JSON.stringify(content)));

    return content;
  };

  updateBop = async (track: Track, provider: BopProvider, server: GameServer) => {
    const { entries } = await this.bop.fetch(provider);
    const content = { entries: entries?.filter((entry) => entry.track === track) };
    await this.fileManager.write('bop.json', content, server);
    await this.channel.log(`[**${server.home_name}**]: bop.json was updated...`);
    return content;
  };
}
