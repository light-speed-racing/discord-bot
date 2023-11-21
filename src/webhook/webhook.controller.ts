import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { WebhookService } from './webhook.service';
import { Entrylist } from './entrylist.type';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post('pre-start')
  @UseGuards(AuthModalGuard)
  async preStart(@Body() dto: PreStartDto): Promise<Entrylist> {
    const entrylist = await this.service.entrylist(dto);

    if (dto.channelId) {
      await this.service.sendMessageInChannel(dto);
    }

    return entrylist;
  }
}
