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

type ConfigFile = AssistRulesJSON | ConfigurationJSON | Entrylist | EventJSON | EventRulesJSON | SettingsJSON | BopJSON;
@Injectable()
export class FileManager {
  constructor(private readonly api: OpenGamePanelApi) {}

  async read<T extends ConfigFile>(filename: keyof ConfigFiles, entry: GameServer): Promise<T> {
    const { message } = await this.api.get<keyof FileManagerModule, string>('litefm/get', {
      port: entry.IpPort.port,
      relative_path: `cfg/${filename}`,
    });

    return JSON.parse(message) as T;
  }

  async update<T extends ConfigFile>(
    data: Record<string, unknown>,
    filename: keyof ConfigFiles,
    entry: GameServer,
  ): Promise<{ message: string; data: T }> {
    const content = {
      ...(await this.read(filename, entry)),
      ...data,
    };

    const { message } = await this.api.get<keyof FileManagerModule, string>('litefm/save', {
      port: entry.IpPort.port,
      relative_path: `cfg/${filename}`,
      contents: JSON.stringify(content, null, 2),
    });
    return {
      message,
      data: content as T,
    };
  }
}
