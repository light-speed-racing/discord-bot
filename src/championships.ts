export type Championship = {
  id: number;
  name: string;
  role: string;
  isTeamEvent?: boolean;
};

export const championships: ReadonlyArray<Championship> = [
  {
    id: 2023,
    name: 'Züüüüüüper GT Zundayz',
    role: 'Züper Zundayz',
  },
  {
    id: 1266,
    name: 'Endurance S1',
    role: 'Endurance S1',
    isTeamEvent: true,
  },
  {
    id: 1449,
    name: 'Midweek League S2',
    role: 'Midweek League S2',
  },
  {
    id: 1749,
    name: '82 cars at Spa',
    role: 'One off - Fill the pool',
  },
  {
    id: 1449,
    name: '105 cars at Suzuka',
    role: 'One off - Running Sushi at Suzuka',
  },
  {
    id: 1449,
    name: '12h at Spa',
    role: 'Endurance - 12h at Spa',
    isTeamEvent: true,
  },
  {
    id: 2014,
    name: 'Kyalami 1000k',
    role: 'Kyalami 1000k',
    isTeamEvent: true,
  },
];
