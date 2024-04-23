import { GifsResult, GiphyFetch, SearchOptions } from '@giphy/js-fetch-api';
import { Injectable } from '@nestjs/common';
import { RootConfig } from 'src/config/config';

@Injectable()
export class GiphyService {
  private readonly client: GiphyFetch;

  constructor(private readonly config: RootConfig) {
    this.client = new GiphyFetch(config.giphy.apiKey);
  }

  async search(query: string, options?: SearchOptions): Promise<GifsResult> {
    return await this.client.search(query, options);
  }
}
