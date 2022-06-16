export enum Championships {
  'Midweek League S1' = '1078',
  'Mixed Sundays S1' = '1209',
  'Summer Challange' = '1366',
  'Mixed Sundays S2' = '1435',
  '4 hours at Suzuka' = '1455',
  'Endurance S1' = '1266',
  'Midweek League S2' = '1449',
}

export const championshipRoles: Record<Championships, string> = {
  [Championships['Summer Challange']]: 'Summer Challenge',
  [Championships['Mixed Sundays S1']]: 'Mixed Sundays S1',
  [Championships['Midweek League S1']]: 'Midweek League S1',
  [Championships['Mixed Sundays S2']]: 'Mixed Sundays S2',
  [Championships['Endurance S1']]: 'Endurance S1',
  [Championships['4 hours at Suzuka']]: '4 hours at Suzuka',
  [Championships['Midweek League S2']]: 'Midweek League S2',
};
