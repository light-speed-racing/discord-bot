import { Injectable, Logger } from '@nestjs/common';
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
  private logger = new Logger(FileManager.name);

  constructor(private readonly api: OpenGamePanelApi) {}

  async read<T extends ConfigFile>(filename: keyof ConfigFiles, entry: GameServer): Promise<T> {
    this.logger.debug(`Reading ${filename} using OGP_API`);
    try {
      const { message } = await this.api.get<keyof FileManagerModule, string>('litefm/get', {
        port: entry.IpPort.port,
        relative_path: `cfg/${filename}`,
      });

      return JSON.parse(message) as T;
    } catch (error) {
      throw new Error(`Error reading ${filename}, ${error}`);
    }
  }

  isEmpty = async (filename: keyof ConfigFiles, { IpPort }: GameServer) => {
    const { message } = await this.api.get<keyof FileManagerModule, string>('litefm/get', {
      port: IpPort.port,
      relative_path: `cfg/${filename}`,
    });

    return !message.length;
  };

  async write<T extends ConfigFile>(
    filename: keyof ConfigFiles,
    data: Record<string, unknown>,
    entry: GameServer,
  ): Promise<{ message: string; data: T }> {
    this.logger.debug(`Write ${filename} using OGP_API`);
    try {
      const { message } = await this.api.get<keyof FileManagerModule, string>('litefm/save', {
        port: entry.IpPort.port,
        relative_path: `cfg/${filename}`,
        contents: JSON.stringify(data, null, 2),
      });
      return {
        message,
        data: data as T,
      };
    } catch (error) {
      throw new Error(`Error writing ${filename}, ${error}`);
    }
  }

  async update<T extends ConfigFile>(
    filename: keyof ConfigFiles,
    data: Record<string, unknown>,
    entry: GameServer,
  ): Promise<{ message: string; data: T }> {
    this.logger.debug(`Updating ${filename} using OGP_API`);
    try {
      const content = {
        ...(await this.read(filename, entry)),
        ...data,
      };
      return await this.write<T>(filename, content, entry);
    } catch (error) {
      throw new Error(`Error updating ${filename}, ${error}`);
    }
  }
}
