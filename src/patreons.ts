/* eslint-disable @typescript-eslint/no-loss-of-precision */
export type Patreon = {
  discordId: number;
  raceNumber: number;
  steamId: string | null;
};

type SteamId = number;

export const Patreons = new Map<SteamId, Patreon>()
  .set(76561199626011162, { raceNumber: 11, discordId: 1200506777570127912, steamId: 'S76561199626011162' }) // S Gee
  .set(76561198051239559, { raceNumber: 13, discordId: 883616496906014741, steamId: 'S76561198051239559' }) // Tickner
  .set(76561198342638728, { raceNumber: 16, discordId: 688405680734077019, steamId: 'S76561198342638728' }) // Stefano Furlan
  .set(76561199247468623, { raceNumber: 30, discordId: 878356315385258014, steamId: 'S76561199247468623' }) // Müller
  .set(76561198031302686, { raceNumber: 85, discordId: 362213817897451521, steamId: 'S76561198031302686' }) // Eeek
  .set(76561199249817935, { raceNumber: 188, discordId: 838598784597360700, steamId: 'S76561199249817935' }) // Paulo Taco
  .set(76561199274976963, { raceNumber: 12, discordId: 998579424813391942, steamId: 'S76561199274976963' }) // Andrea Furlan
  .set(76561199147180015, { raceNumber: 14, discordId: 821928912635428904, steamId: 'S76561199147180015' }) // Spencer
  .set(76561198079364851, { raceNumber: 32, discordId: 367427290428080148, steamId: 'S76561198079364851' }) // Ryan
  .set(76561199076112515, { raceNumber: 37, discordId: 725368578479489037, steamId: 'S76561199076112515' }) // Ferry
  .set(76561198112678444, { raceNumber: 16, discordId: 721066327355424788, steamId: 'S76561198112678444' }) // Pascal
  .set(76561199381496111, { raceNumber: 58, discordId: 990492981796683876, steamId: 'S76561199381496111' }) // ayrton
  .set(732305540268425269, { raceNumber: 46, discordId: 732305540268425269, steamId: 'S76561198166194464' }) // Mike Ranner
  .set(null, { raceNumber: 5, discordId: 285385820423323658, steamId: null }) // Jan Budde
  .set(null, { raceNumber: 7, discordId: 415517703256801280, steamId: null }) // Oliver
  .set(null, { raceNumber: 89, discordId: 838598784597360700, steamId: null }); // Shoebop
