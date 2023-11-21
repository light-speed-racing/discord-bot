import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { EntrylistService } from './entrylist.service';
import { Entrylist } from './entrylist.type';
import { CustomFieldsService } from './open-game-panel.service';

@Controller('webhooks')
export class WebhookController {
  private logger = new Logger(WebhookController.name);
  constructor(private readonly entrylist: EntrylistService, private readonly customFields: CustomFieldsService) {}

  @Get('/')
  helloWorld() {
    return 'Hello world';
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

    return entrylist ?? EntrylistService.emptyEntrylist;
  }
}
