export type Bop = {
  entries: Array<{
    track: string;
    carModel: number;
    ballastKg?: number;
    restrictor?: number;
  }>;
};
