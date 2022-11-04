export type Championship = {
  // The Simgrid ID for the event
  id: number;

  // The name of the event (internal only)
  name?: string;

  // Name of the role that should be connected with the event
  role: string;

  // Indicates if the event is a team event
  driverSwap?: boolean;
};

export const championships: ReadonlyArray<Championship> = [
  { id: 2023, role: 'Züper Zundayz' },
  { id: 1266, role: 'Endurance S1', driverSwap: true },
  { id: 1449, role: 'Midweek League S2' },
  { id: 1917, role: 'One off - Running Sushi at Suzuka' },
  { id: 1660, role: 'Endurance - 12h at Spa', driverSwap: true },
  { id: 2014, role: 'Kyalami 1000k', driverSwap: true },
  { id: 2084, role: 'Versus Thursdays' },
  { id: 2272, role: 'Eco Lovers Spa Day' },
  { id: 2332, role: 'Winter Challenge' },
  { id: 2373, role: 'Mega Grid - Watkins Glen' },
];
