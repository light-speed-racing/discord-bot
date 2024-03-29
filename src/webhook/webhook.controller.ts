import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { EntrylistService } from '../simgrid/entrylist.service';
import { GameServerService } from '../open-game-panel/game-server.service';
import { ChannelService } from './channel.service';
import { TextChannel, roleMention } from 'discord.js';
import { BopJSON, ConfigurationJSON, Entrylist, EventJSON, SettingsJSON } from 'src/assetto-corsa-competizione.types';
import { GiphyService } from 'src/giphy/giphy.service';
import sample from 'lodash.sample';
import { EmbedBuilder } from '@discordjs/builders';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { GameServer } from 'src/database/game-server.entity';
import { BalanceOfPerformanceService } from 'src/simgrid/balance-of-performance.service';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);

  constructor(
    private readonly entrylist: EntrylistService,
    private readonly bop: BalanceOfPerformanceService,
    private readonly gameServer: GameServerService,
    private readonly channel: ChannelService,
    private readonly giphy: GiphyService,
    private readonly fileManager: FileManager,
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
    this.logger.log('Incommimng request', { homedir });
    const entity = !!homedir && (await this.gameServer.homedir(homedir));

    if (!entity.custom_fields?.is_enabled) {
      return;
    }

    if (!entity.custom_fields?.simgrid_id) {
      return EntrylistService.emptyEntrylist;
    }

    await this.updatePortsInConfiguration(entity);

    if (entity.custom_fields?.channel_id) {
      await this.notifyChannel(entity);
    }

    return await this.entrylist.fetch(entity.custom_fields?.simgrid_id);
  }

  private updatePortsInConfiguration = async (entity: GameServer): Promise<void> => {
    const { port } = entity.IpPort;
    this.logger.debug(`updatePortsInConfiguration: ${entity.home_name}`);
    const existing = await this.fileManager.read<ConfigurationJSON>('configuration.json', entity);
    if (existing.tcpPort === port && existing.udpPort === port) {
      return;
    }
    await this.fileManager.update('configuration.json', { ...existing, tcpPort: port, udpPort: port }, entity);

    return;
  };

  private notifyChannel = async (entity: GameServer) => {
    const {
      custom_fields: { channel_id, role_id },
    } = entity;
    const { data } = await this.giphy.search('race time');
    const settings = await this.fileManager.read<SettingsJSON>('settings.json', entity);
    const event = await this.fileManager.read<EventJSON>('event.json', entity);

    return await this.channel.find<TextChannel>(channel_id).send({
      content: [
        [role_id && `${roleMention(role_id)}!`, `IT'S RACE TIME!`].filter(Boolean).join(' '),
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
          fields: [
            { name: 'Server Name', value: `${settings.serverName}`, inline: true },
            { name: 'Password', value: `${settings.password}`, inline: true },
            { name: 'Track', value: `${event.track}`, inline: true },
          ],
          image: { url: sample(data).images.downsized.url },
        }),
      ],
    });
  };
}
