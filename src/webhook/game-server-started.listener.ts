import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelService } from 'src/webhook/channel.service';
import { GiphyService } from 'src/giphy/giphy.service';
import { FileManager } from 'src/open-game-panel/file-manager.service';
import { EmbedBuilder, roleMention } from '@discordjs/builders';
import { Colors, TextChannel } from 'discord.js';
import capitalize from 'lodash.capitalize';
import sample from 'lodash.sample';
import { EventJSON, SettingsJSON } from 'src/assetto-corsa-competizione.types';
import { GameServer } from 'src/database/game-server.entity';

@Injectable()
export class GameServerStartedListener {
  constructor(
    private readonly channel: ChannelService,
    private readonly giphy: GiphyService,
    private readonly fileManager: FileManager,
  ) {}

  @OnEvent('game-server.started', { async: true, promisify: true })
  async notifyChannel({ entity }: { entity: GameServer }) {
    const {
      custom_fields: { role_id, channel_id },
    } = entity;

    if (!entity.custom_fields?.channel_id) {
      return;
    }

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
