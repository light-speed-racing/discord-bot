import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FtpClient from 'ftp-deploy';
import { Config } from 'src/config/config.types';
import { ServerSetupConfig } from 'src/config/server-setup.config';

@Injectable()
export class FtpService {
  private readonly logger: Logger = new Logger(FtpService.name);
  private readonly ftp = new FtpClient();

  private ftpConfig = {
    include: ['*.json'],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
    user: undefined,
    password: undefined,
    host: undefined,
    port: undefined,
    remoteRoot: undefined,
  };

  constructor(private readonly config: ConfigService<Config>) {
    const {
      ftp: { host, password, port, username },
    } = this.config.get<ServerSetupConfig>('server-setup');

    this.ftpConfig = {
      ...this.ftpConfig,
      user: username,
      password,
      host,
      port: Number(port),
      remoteRoot:
        this.config.get<ServerSetupConfig>('server-setup').ftp.configPath,
    };
  }

  async connectAndUploadFrom(localRoot: string) {
    try {
      const config = { ...this.ftpConfig, localRoot };
      this.logger.debug(
        `Uploading files to game server ${JSON.stringify(
          { remote: config.remoteRoot, localRoot },
          null,
          2,
        )}`,
      );
      return await this.ftp.deploy(config);
    } catch (error) {
      return error.message;
    }
  }
}
