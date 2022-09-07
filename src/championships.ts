export enum Championships {
  'Züüüüüüper GT Zundayz' = '2023',
  'Endurance S1' = '1266',
  'Midweek League S2' = '1449',
  '82 cars at Spa' = '1746',
  '12 hours at Spa' = '1660',
  '105 cars at Suzuka' = '1917',
}

export const championshipRoles: Record<Championships, string> = {
  [Championships['Endurance S1']]: 'Endurance S1',
  [Championships['Midweek League S2']]: 'Midweek League S2',
  [Championships['12 hours at Spa']]: 'Endurance - 12h at Spa',
  [Championships['82 cars at Spa']]: 'One off - Fill the pool',
  [Championships['105 cars at Suzuka']]: 'One off - Running Sushi at Suzuka',
  [Championships['Züüüüüüper GT Zundayz']]: 'Zuper GT Zundayz',
};
