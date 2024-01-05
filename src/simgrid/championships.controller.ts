import { Controller, Get } from '@nestjs/common';
import { SimgridApi } from './simgrid-api.service';

@Controller('championships')
export class ChampionshipsController {
  constructor(private readonly api: SimgridApi) {}
  @Get('')
  async championships() {
    await this.api.championships();

    return 'Champiopnships';
  }
}
