import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
// @see: https://github.com/OpenGamePanel/OGP-Website/blob/master/ogp_api.php#L42-L46
export class LiteFileManager {
  private readonly url: string;
  private readonly token: string;
  private readonly ip: string;
  private readonly port: string;

  constructor(options: { url: string; token: string; ip: string; port: string }) {
    Object.assign(this, options);
  }

  // @TODO:
  async list(path: string) {}

  // @TODO:
  async get(path: string) {}

  // @TODO:
  async remove(path: string) {}
}
