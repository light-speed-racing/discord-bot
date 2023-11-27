import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { EntrylistService } from '../simgrid/entrylist.service';
import { Entrylist } from '../simgrid/entrylist.type';
import { CustomFieldsService } from '../open-game-panel/custom-fields-service.service';
import { ChannelService } from './channel.service';
import { TextChannel, roleMention } from 'discord.js';
import { join } from 'path';
import { readFileSync } from 'fs';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);
  constructor(
    private readonly entrylistService: EntrylistService,
    private readonly customFields: CustomFieldsService,
    private readonly channel: ChannelService,
  ) {}

  @Get('/')
  async helloWorld() {
    return 'Hello World';
  }

  @Get('bop')
  @UseGuards(AuthModalGuard)
  async bop() {
    const path = join(__dirname, '../..', 'bop.json');

    return readFileSync(path, 'base64');
  }

  @Post('entrylist')
  @UseGuards(AuthModalGuard)
  async entrylist(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    this.logger.log('Incommimng request', { homedir });
    if (!homedir) {
      this.logger.log('No homedir provided. Sending empty entrylist');
      return EntrylistService.emptyEntrylist;
    }

    const {
      custom_fields: { channel_id, entrylist_url, role_id },
    } = await this.customFields.for(homedir);

    const entrylist = await this.entrylistService.fetch(entrylist_url);

    if (channel_id) {
      await this.channel
        .find<TextChannel>(channel_id)
        .send(
          [
            role_id && `Hey ${roleMention(role_id)}! How daaare you...\n`,
            'The race server is starting! I have updated the entrylist for you',
          ]
            .filter(Boolean)
            .join(' '),
        );
    }

    return entrylist ?? EntrylistService.emptyEntrylist;
  }
}
