export enum Championships {
  'Summer Challange' = '1366',
  'Mixed Sundays S2' = '1435',
  'Endurance S1' = '1266',
  'Midweek League S2' = '1449',
  'Comming to America' = '1734',
  '82 cars at Spa' = '1746',
  '12 hours at Spa' = '1660',
}

export const championshipRoles: Record<Championships, string> = {
  [Championships['Summer Challange']]: 'Summer Challenge',
  [Championships['Mixed Sundays S2']]: 'Mixed Sundays S2',
  [Championships['Endurance S1']]: 'Endurance S1',
  [Championships['Midweek League S2']]: 'Midweek League S2',
  [Championships['Comming to America']]: 'One off - Comming to America',
  [Championships['82 cars at Spa']]: 'One off - Fill the pool',
  [Championships['12 hours at Spa']]: 'Endurance - 12h at Spa',
};
