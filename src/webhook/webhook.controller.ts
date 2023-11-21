import { Body, Controller, Post, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { EntrylistService } from './entrylist.service';
import { Entrylist } from './entrylist.type';
import { CustomFieldsService } from './open-game-panel.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly entrylist: EntrylistService, private readonly customFields: CustomFieldsService) {}

  @Post('pre-start')
  @UseGuards(AuthModalGuard)
  async preStart(@Body() { homedir }: PreStartDto): Promise<Entrylist> {
    if (!homedir) {
      throw new UnprocessableEntityException();
    }

    const { entrylistUrl } = await this.customFields.for(homedir);
    const entrylist = await this.entrylist.fetch(entrylistUrl);

    return entrylist;
  }
}
