import { Track } from './assetto-corsa-competizione.types';

type RaceTrack = {
  coordinates: [number, number];
};

export const RaceTracks: Record<Track, RaceTrack> = {
  barcelona: { coordinates: [41.5704, 2.2586] },
  brands_hatch: { coordinates: [51.3569, 0.2631] },
  cota: { coordinates: [30.1328, -97.6412] },
  donington: { coordinates: [52.8308, -1.3757] },
  hungaroring: { coordinates: [47.5789, 19.2486] },
  imola: { coordinates: [44.3439, 11.7167] },
  indianapolis: { coordinates: [39.795, -86.2343] },
  kyalami: { coordinates: [-25.9895, 28.0767] },
  laguna_seca: { coordinates: [36.5841, -121.7531] },
  misano: { coordinates: [43.9633, 12.6819] },
  monza: { coordinates: [45.6156, 9.2811] },
  mount_panorama: { coordinates: [-33.4372, 149.5636] },
  nurburgring: { coordinates: [50.3356, 6.9475] },
  nurburgring_24h: { coordinates: [50.3356, 6.9475] },
  oulton_park: { coordinates: [53.2286, -2.6575] },
  paul_ricard: { coordinates: [43.2506, 5.7917] },
  red_bull_ring: { coordinates: [47.2197, 14.7647] },
  silverstone: { coordinates: [52.0786, -1.0169] },
  snetterton: { coordinates: [52.4725, 0.9394] },
  spa: { coordinates: [50.4372, 5.9714] },
  suzuka: { coordinates: [34.8431, 136.5417] },
  watkins_glen: { coordinates: [42.3392, -76.9283] },
  zolder: { coordinates: [51.0347, 5.2617] },
  zandvoort: { coordinates: [52.3886, 4.5422] },
  valencia: { coordinates: [39.4589, -0.3317] },
};
