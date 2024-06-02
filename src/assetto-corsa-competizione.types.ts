export type EntrylistEntry = Entrylist['entries'][number];

export type ConfigFiles = {
  'assistRules.json': AssistRulesJSON;
  'configuration.json': ConfigurationJSON;
  'entrylist.json': Entrylist;
  'event.json': EventJSON;
  'eventRules.json': EventRulesJSON;
  'settings.json': SettingsJSON;
  'bop.json': BopJSON;
};

export type Entrylist = {
  entries: Array<{
    drivers: Array<{
      firstName: string;
      lastName: string;
      shortName: string;
      driverCategory: 0 | 1 | 2 | 3;
      nationality: number;
      playerID: string;
    }>;
    raceNumber: number;
    forcedCarModel: number;
    overrideDriverInfo: 0 | 1;
    defaultGridPosition: number;
    ballastKg: number;
    restrictor: number;
    isServerAdmin: 0 | 1;
  }>;
  forceEntryList: 0 | 1;
};

export type SettingsJSON = {
  serverName: string;
  adminPassword: string;
  carGroup: 'GT3' | 'GT4' | 'FreeForAll' | 'GTC';
  trackMedalsRequirement?: 0 | 1 | 2 | 3;
  safetyRatingRequirement?: -1 | number;
  racecraftRatingRequirement?: -1 | number;
  password?: string;
  spectatorPassword?: number;
  maxCarClots: number;
  dumpLeaderboards?: 0 | 1;
  dumpEntryList?: unknown;
  isRaceLocked?: 0 | 1;
  shortFormationLap?: 0 | 1;
  formationLapType?: 0 | 1 | 3 | 4 | 5;
  doDriverSwapBroadcast?: unknown;
  randomizeTrackWhenEmpty?: 0 | 1;
  centralEntryListPath?: string;
  allowAutoDQ?: 0 | 1;
  ignorePrematureDisconnects?: 0 | 1;
  configVersion: number;
};

export type AssistRulesJSON = {
  stabilityControlLevelMax: number;
  disableAutosteer: 0 | 1;
  disableIdealLine: 0 | 1;
  disableAutoPitLimiter: 0 | 1;
  disableAutoGear: 0 | 1;
  disableAutoClutch: 0 | 1;
  disableAutoEngineStart: 0 | 1;
  disableAutoWiper: 0 | 1;
  disableAutoLights: 0 | 1;
};

export type EventRulesJSON = {
  qualifyStandingType?: 1 | 2;
  superpoleMaxCar?: unknown;
  pitWindowLengthSec?: -1 | number;
  driverStintTimeSec?: -1 | number;
  isRefuellingAllowedInRace?: boolean;
  isRefuellingTimeFixed?: boolean;
  mandatoryPitstopCount?: -1 | number;
  maxTotalDrivingTime?: -1 | number;
  maxDriversCount?: -1 | number;
  isMandatoryPitstopRefuellingRequired?: boolean;
  isMandatoryPitstopTyreChangeRequired?: boolean;
  isMandatoryPitstopSwapDriverRequired?: boolean;
  tyreSetCount?: number;
};

export type Track =
  | 'barcelona'
  | 'brands_hatch'
  | 'cota'
  | 'donington'
  | 'hungaroring'
  | 'imola'
  | 'indianapolis'
  | 'kyalami'
  | 'laguna_seca'
  | 'misano'
  | 'monza'
  | 'mount_panorama'
  | 'nurburgring'
  | 'oulton_park'
  | 'paul_ricard'
  | 'red_bull_ring'
  | 'silverstone'
  | 'snetterton'
  | 'spa'
  | 'suzuka'
  | 'watkins_glen'
  | 'zolder'
  | 'zandvoort'
  | 'nurburgring_24h';

export type EventJSON = {
  track: Track;
  eventType: 'E_3h' | 'E_6h' | 'E_9h' | 'E_24h';
  sessions: Array<{
    hourOfDay: number;
    dayOfWeekend: 1 | 2 | 3;
    timeMultiplier?: number;
    sessionType: 'P' | 'Q' | 'R';
    sessionDurationMinutes: number;
  }>;
  preRaceWaitingTimeSeconds?: number;
  sessionOverTimeSeconds?: number;
  ambientTemp?: number;
  cloudLevel?: number;
  rain?: number;
  weatherRandomness?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  postQualySeconds?: number;
  postRaceSeconds?: number;
  metaData?: string;
  simracerWeatherConditions?: 0 | 1;
  isFixedConditionQualification?: 0 | 1;
};

export type ConfigurationJSON = {
  tcpPort: number;
  udpPort: number;
  registerToLobby: 0 | 1;
  maxConnections: number;
  lanDiscovery: 0 | 1;
};

export type BopJSON = {
  entries?: Array<{
    track: EventJSON['track'];
    carModel: number;
    ballastKg?: number;
    restrictor?: number;
  }>;
};
