/* eslint-disable @typescript-eslint/no-loss-of-precision */
export type Patreon = {
  discordId: number;
  raceNumber: number;
};

type SteamId = number;

export const Patreons = new Map<SteamId, Patreon>()
  .set(76561198051239559, { raceNumber: 13, discordId: 883616496906014741 }) // Tickner
  .set(76561198342638728, { raceNumber: 16, discordId: 688405680734077019 }) // Stefano Furlan
  .set(76561199247468623, { raceNumber: 30, discordId: 878356315385258014 }) // Müller
  .set(76561198031302686, { raceNumber: 85, discordId: 362213817897451521 }) // Eeek
  .set(76561199249817935, { raceNumber: 188, discordId: 838598784597360700 }) // Paulo Taco
  .set(76561199274976963, { raceNumber: 12, discordId: 998579424813391942 }) // Andrea Furlan
  .set(76561199147180015, { raceNumber: 14, discordId: 821928912635428904 }) // Spencer
  .set(76561198118872521, { raceNumber: 15, discordId: 406060014919221249 }) // Rick Pink
  .set(76561198079364851, { raceNumber: 32, discordId: 367427290428080148 }) // Ryan
  .set(76561199076112515, { raceNumber: 37, discordId: 725368578479489037 }) // Ferry
  .set(76561197985618443, { raceNumber: 75, discordId: 501092515542466570 }) // Jonas
  .set(76561198314937562, { raceNumber: null, discordId: 543838291296780303 }) // Franco
  .set(null, { raceNumber: 5, discordId: 285385820423323658 }) // Jan Budde
  .set(null, { raceNumber: 7, discordId: 415517703256801280 }) // Oliver
  .set(null, { raceNumber: 57, discordId: 391218402376810496 }) // Daan
  .set(null, { raceNumber: 64, discordId: 667880127266291733 })
  .set(null, { raceNumber: 74, discordId: 680324364561940480 }) // Scott
  .set(null, { raceNumber: 89, discordId: 838598784597360700 }) // Shoebop
  .set(null, { raceNumber: 999, discordId: 571745335513186306 }); // delusion_khan
