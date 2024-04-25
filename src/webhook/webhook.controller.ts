import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { EntrylistService } from '../simgrid/entrylist.service';
import { GameServerService } from '../open-game-panel/game-server.service';
import { BopJSON, Entrylist, EventJSON, SettingsJSON } from 'src/assetto-corsa-competizione.types';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameServer } from 'src/database/game-server.entity';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';
import { EmbedBuilder, roleMention } from '@discordjs/builders';
import sample from 'lodash.sample';
import { Colors, TextChannel } from 'discord.js';
import capitalize from 'lodash.capitalize';
import { GiphyService } from 'src/common/giphy.service';
import { DiscordChannelService } from 'src/common/discord-channel.service';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);

  constructor(
    private readonly entrylist: EntrylistService,
    private readonly bop: BalanceOfPerformanceService,
    private readonly gameServer: GameServerService,
    private readonly fileManager: FileManager,
    private readonly channel: DiscordChannelService,
    private readonly giphy: GiphyService,
  ) {}

  @Get('/')
  async helloWorld() {
    return 'Hello World';
  }

  @Post('bop')
  async getBop(@Body() { homedir }: PreStartDto): Promise<BopJSON> {
    const entity = !!homedir && (await this.gameServer.homedir(homedir));

    if (!entity.custom_fields?.is_enabled) {
      return;
    }

    return await this.bop.fetch(entity.custom_fields?.bop_provider);
  }

  @Post('entrylist')
  async getEntrylist(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    this.logger.log('Incoming request', { homedir });
    const entity = !!homedir && (await this.gameServer.homedir(homedir));
    const { custom_fields } = entity;

    await this.gameServer.updateConfigurationJson(entity);

    if (custom_fields?.is_enabled && custom_fields?.live_weather) {
      await this.gameServer.updateWeather(entity);
    }

    if (custom_fields?.channel_id) {
      await this.notifyDiscordChannel(entity);
    }

    return custom_fields?.simgrid_id
      ? await this.entrylist.fetch(custom_fields?.simgrid_id)
      : EntrylistService.emptyEntrylist;
  }

  private async notifyDiscordChannel(gameServer: GameServer) {
    const { custom_fields } = gameServer;

    const { data } = await this.giphy.search('race time');
    const settings = await this.fileManager.read<SettingsJSON>('settings.json', gameServer);
    const event = await this.fileManager.read<EventJSON>('event.json', gameServer);

    return await this.channel.find<TextChannel>(custom_fields.channel_id).send({
      content: [
        [custom_fields.role_id && `${roleMention(custom_fields.role_id)}!`, `IT'S RACE TIME!`]
          .filter(Boolean)
          .join(' '),
        'The server is starting...',
        '**__As a back marker__**: Be predictable. Hold your line. Lift off the throttle to let the faster car by. Let faster cars by on the first straight',
        '**__As a overtaking car__**: Be predictable. It is your job to overtake safely. No dive bombing. Wait till you are let by',
        '**__Sportsmanship__**: When crashing re-enter safely. Wait for clear space to re-enter. If you cause a collision, be a gentleman and give back the spot',
        '**__Be aware and be careful__**:  Please be very careful on the first couple of laps. Use the radar. Be careful - You might ruin the race for others if you are not careful',
        '**__Safety on track!__**: PLEASE for the love of god. Please act in a safe manner! No turning around into incoming traffic! No full send on the first couple of laps!',
        '',
        'Also, please do not use the game chat during qualification and the race. It might cost you a 5sec penalty',
      ]
        .filter(Boolean)
        .join('\n'),
      embeds: [
        new EmbedBuilder({
          image: { url: sample(data).images.downsized.url },
        }),
        new EmbedBuilder({
          title: 'Server configuration',
          color: Colors.DarkBlue,
          fields: [
            { name: 'Server Name', value: `${settings.serverName}` },
            { name: 'Password', value: `${settings.password}` },
            { name: 'Track', value: `${capitalize(event.track).replace(/\_/g, ' ')}` },
          ],
        }),
        new EmbedBuilder({
          title: 'Weather forecast',
          color: Colors.DarkBlue,
          fields: [
            { name: 'Ambient temp.', value: `${event.ambientTemp}°C`, inline: true },
            { name: 'Cloud level', value: `${event.cloudLevel * 100}%`, inline: true },
            { name: 'Rain', value: `${event.rain * 100}%`, inline: true },
            { name: 'Weather randomness', value: `${event.weatherRandomness}`, inline: true },
          ],
        }),
      ],
    });
  }
}
