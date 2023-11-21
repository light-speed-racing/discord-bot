import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { EntrylistService } from './entrylist.service';
import { Entrylist } from './entrylist.type';
import { CustomFieldsService } from './open-game-panel.service';
import { ChannelService } from './channel.service';
import { TextChannel, roleMention } from 'discord.js';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);
  constructor(
    private readonly entrylist: EntrylistService,
    private readonly customFields: CustomFieldsService,
    private readonly channel: ChannelService,
  ) {}

  @Get('/')
  async helloWorld() {
    return this.channel
      .find<TextChannel>('843028833984053250')
      .send(`${roleMention('886139426726625350')} the race server is starting!`);
  }

  @Post('pre-start')
  @UseGuards(AuthModalGuard)
  async preStart(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    this.logger.log('Incommimng request');
    if (!homedir) {
      return EntrylistService.emptyEntrylist;
    }

    const { custom_fields } = await this.customFields.for(homedir);

    const entrylist = await this.entrylist.fetch(custom_fields.entrylist_url);

    await this.channel
      .find<TextChannel>(custom_fields.channel_id)
      .send(`${roleMention(custom_fields.role_id)} the race server is starting!`);

    return entrylist ?? EntrylistService.emptyEntrylist;
  }
}
