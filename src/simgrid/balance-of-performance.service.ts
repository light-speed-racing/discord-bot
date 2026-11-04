import { Injectable } from '@nestjs/common';
import { BopJSON } from 'src/assetto-corsa-competizione.types';
import { BopProvider } from 'src/database/game-server.entity';
import lfmBop from '../data/acc-lfm-bop.json';

@Injectable()
export class BalanceOfPerformanceService {
  async fetch(provider: BopProvider): Promise<BopJSON> {
    switch (provider) {
      case 'lfm':
        return lfmBop as BopJSON;
      case 'kunos':
      default:
        return {};
    }
  }
}
