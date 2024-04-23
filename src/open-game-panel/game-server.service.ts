import { Injectable, Logger } from '@nestjs/common';
import { GameServer } from 'src/database/game-server.entity';
import { Not, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RootConfig } from 'src/config/config';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
    private readonly config: RootConfig,
  ) {}

  async homedir(home_path: string): Promise<GameServer> {
    this.logger.log('Getting custom fields for:', home_path);

    const entity = await this.repository.findOneByOrFail({ home_path });

    this.logger.log('Found:', JSON.stringify(entity));

    return entity;
  }

  async getServersThatShouldHaveARestartJob() {
    return (await this.repository.findBy({ custom_fields: Not(IsNull()) }))
      .filter((entry) => !!entry.custom_fields)
      .filter(({ custom_fields }) => !!custom_fields.is_enabled)
      .filter(({ custom_fields }) => !!custom_fields.simgrid_id && !!custom_fields.live_weather)
      .filter(({ home_id }) => this.config.env === 'development' && home_id === 25) // @TODO: This needs to be removed
      .filter(Boolean);
  }
}
