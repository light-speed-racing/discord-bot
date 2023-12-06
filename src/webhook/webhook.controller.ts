import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { EntrylistService } from '../simgrid/entrylist.service';
import { CustomFieldsService } from '../open-game-panel/custom-fields-service.service';
import { ChannelService } from './channel.service';
import { TextChannel, roleMention } from 'discord.js';
import { Entrylist } from 'src/assetto-corsa-competizione.types';
import { GiphyService } from 'src/giphy/giphy.service';
import sample from 'lodash.sample';
import { EmbedBuilder } from '@discordjs/builders';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);
  constructor(
    private readonly entrylist: EntrylistService,
    private readonly customFields: CustomFieldsService,
    private readonly channel: ChannelService,
    private readonly giphy: GiphyService,
  ) {}

  @Get('/')
  async helloWorld() {
    return 'Hello World';
  }

  @Post('pre-start')
  @UseGuards(AuthModalGuard)
  async preStart(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    this.logger.log('Incommimng request', { homedir });
    if (!homedir) {
      this.logger.log('No homedir provided. Sending empty entrylist');
      return EntrylistService.emptyEntrylist;
    }

    const {
      custom_fields: { channel_id, entrylist_url, role_id },
    } = (await this.customFields.for(homedir)) ?? {};

    if (!entrylist_url) {
      return EntrylistService.emptyEntrylist;
    }

    if (channel_id) {
      const { data } = await this.giphy.search('race time');

      await this.channel.find<TextChannel>(channel_id).send({
        content: [
          [role_id && `${roleMention(role_id)}!`, `IT'S RACE TIME!`].filter(Boolean).join(' '),
          '',
          'The server is starting...',
          '',
          'I have updated the entrylist and BOP for you',
          `One thing that is important to the team is that WE ARE ALL HERE TO HAVE FUN. Please remember that we just want to have fun and that nobody wants to have their race ruined. Let's recap the rules regarding blueflags and sportsmanship`,
          '',
          '**3.3.2** Drivers are obligated to maintain a predictable line when under blue flag and let the lapping car through when it is safe i.e. lifting on a straight',
          '**3.3.3** A car is allowed to unlap themself as long as they are able to maintain a faster pace',
          '**3.3.4** When lapping a car it is the faster cars responsibility to over take in a safe manner. Any contact may result in a penalty',
          '**3.3.5** The the gap between the blue flagged car and the lapping car is 0.3s or less, the blue flagged car has to yield to the lapping car',
          '',
          '**__As a back marker__**',
          'Be predictable. Hold your line. Lift off the throttle to let the faster car by. Let faster cars by on the first straight',
          '',
          '**__As a overtaking car__**',
          'Be predictable. It is your job to overtake safely. No dive bombing. Wait till you are let by',
          '',
          '**__Sportsmanship__**',
          'When crashing re-enter safely. Wait for clear space to re-enter. If you cause a collision, be a gentleman and give back the spot',
          '',
          '**__Be aware and be careful__**. Please be very careful on the first couple of laps. Use the radar. Be careful - You might ruin the race for others if you are not careful',
          '',
          '**__Safety on track!__**',
          'PLEASE for the love of god. Please act in a safe manner! No turning around into incoming traffic! No full send on the first couple of laps!',
          '',
          'Also, please do not use the game chat during qualification and the race. It might cost you a 5sec penalty',
        ]
          .filter(Boolean)
          .join('\n'),
        embeds: [
          new EmbedBuilder({
            image: { url: sample(data).images.downsized.url },
          }),
        ],
      });
    }

    return (await this.entrylist.fetch(entrylist_url)) ?? EntrylistService.emptyEntrylist;
  }
}
