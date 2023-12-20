import { Injectable } from '@nestjs/common';
import { OpenGamePanelApi } from './open-game-panel-api.service';
import { GameServer } from 'src/database/game-server.entity';
import { FileManagerModule } from './file-manager-module.type';
import {
  AssistRulesJSON,
  BopJSON,
  ConfigFiles,
  ConfigurationJSON,
  Entrylist,
  EventJSON,
  EventRulesJSON,
  SettingsJSON,
} from '../assetto-corsa-competizione.types';

type File = {
  filename: string;
  group: string;
  user: 'cyg_server';
  size: number;
};

type FileList = {
  directorys: Record<string, File>;
  binarys: Record<string, File>;
  files: Record<string, File>;
};

@Injectable()
export class FileManager {
  constructor(private readonly api: OpenGamePanelApi) {}

  async readConfig<
    T extends AssistRulesJSON | ConfigurationJSON | Entrylist | EventJSON | EventRulesJSON | SettingsJSON | BopJSON,
  >(filename: keyof ConfigFiles, entry: GameServer): Promise<T> {
    const { message } = await this.api.get<keyof FileManagerModule, FileList>('litefm/get', {
      port: entry.IpPort.port,
      relative_path: `cfg/${filename}`,
    });

    return JSON.parse(JSON.stringify(message)) as T;
  }
}
