import { Injectable, Logger } from '@nestjs/common';
import { GameServer } from 'src/database/game-server.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  constructor(
    @InjectRepository(GameServer)
    private readonly repository: Repository<GameServer>,
  ) {}

  async homedir(home_path: string): Promise<GameServer> {
    this.logger.log('Getting custom fields for:', home_path);

    const entity = await this.repository.findOneByOrFail({ home_path });

    this.logger.log('Found:', JSON.stringify(entity));

    return entity;
  }
}
