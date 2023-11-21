import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PreStartDto } from './pre-start.dto';
import { AuthModalGuard } from 'src/guard/auth-token.guard';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Post('pre-start')
  @UseGuards(AuthModalGuard)
  async preStart(@Body() dto: PreStartDto): Promise<string> {
    const entrylist = await this.service.entrylist(dto.entrylistUrl);

    return JSON.stringify(entrylist);
  }
}
