export enum Championships {
  'Summer Challange' = '1366',
  'Mixed Sundays S2' = '1435',
  'Endurance S1' = '1266',
  'Midweek League S2' = '1449',
}

export const championshipRoles: Record<Championships, string> = {
  [Championships['Summer Challange']]: 'Summer Challenge',
  [Championships['Mixed Sundays S2']]: 'Mixed Sundays S2',
  [Championships['Endurance S1']]: 'Endurance S1',
  [Championships['Midweek League S2']]: 'Midweek League S2',
};
