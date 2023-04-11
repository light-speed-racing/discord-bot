import { Logger } from '@nestjs/common';
import axios, { HttpStatusCode } from 'axios';
import { Hotlap } from 'src/hotlap/hotlap.entity';

type OgpListResponse = {
  status: string;
  message: { binarys: Record<number, { group: string; size: number; user: 'cyg_server'; filename: string }> } | string;
};

type OgpResultFileDriver = {
  firstName: string;
  lastName: string;
  shortName: string;
  playerId: string;
};

type Penalty = {
  carId: number;
  driverIndex: number;
  reason: string;
  penalty: string;
  penaltyValue: number;
  violationInLap: number;
  clearedInLap: number;
};

type OgpResultFile = {
  sessionType: 'FP' | 'Q' | 'R';
  trackName: string;
  sessionIndex: number;
  raceWeekendIndex: number;
  metaData: string;
  serverName: string;
  sessionResult: {
    bestlap: number;
    bestSplits: [number, number, number];
    isWetSession: 1 | 0;
    type: 1 | 0; // ????
    leaderBoardLines: Array<{
      car: {
        carId: number;
        raceNumber: number;
        carModel: number;
        cupCategory: number;
        carGroup: string;
        teamName: string;
        nationality: number;
        carGuid: number;
        teamGuid: number;
        drivers: Array<OgpResultFileDriver>;
      };
      currentDriver: OgpResultFileDriver;
      currentDriverIndex: number;
      timing: {
        lastLap: number;
        lastSplits: [number, number, number];
        bestLap: number;
        bestSplits: [number, number, number];
        totalTime: number;
        lapCount: number;
        lastSplitId: number;
      };
      missingMandatoryPitstop: number;
      driverTotalTimes: [number];
    }>;
    laps: Array<{
      carId: number;
      driverIndex: number;
      laptime: number;
      isValidForBest: boolean;
      splits: [number, number, number];
    }>;
    penalties: Array<Penalty>;
    post_race_penalties: Array<Penalty>;
  };
};

export class LiteFileManager {
  private readonly logger = new Logger(LiteFileManager.name);

  constructor(private readonly hotlap: Hotlap) {
    this.logger.verbose(`Handling litefm for hotlap: ${hotlap.id}`);
  }

  async list() {
    this.logger.verbose(`list->results`);
    return await this.fetch<OgpListResponse>(this.url('list', 'results'));
  }

  async get(relativePath: string) {
    this.logger.verbose(`get->${relativePath}`);
    return await this.fetch<OgpResultFile>(this.url('get', relativePath));
  }

  async remove(relativePath: string) {
    this.logger.verbose(`remove->${relativePath}`);
    return await this.fetch<{ status: string; message: string }>(this.url('remove', relativePath));
  }

  private url(area: 'list' | 'get' | 'remove', relativePath: string): string {
    return [
      `${this.hotlap.openGamePanelData.url}?litefm/${area}`,
      `token=${this.hotlap.openGamePanelData.token}`,
      `ip=${this.hotlap.openGamePanelData.ip}`,
      `port=${this.hotlap.openGamePanelData.port}`,
      `relative_path=${relativePath}`,
    ].join('&');
  }

  private async fetch<T extends Record<string, unknown> = Record<string, unknown>>(url: string) {
    const { status, statusText, data } = await axios.get<T>(url);

    if (status !== HttpStatusCode.Ok) {
      this.logger.error(`Could not fetch ${url}`);
      throw new Error(statusText);
    }

    return data;
  }
}
