type Port = { port: number | string };

export type Module = {
  'gamemanager/start': Port;
  'gamemanager/stop': Port;
  'gamemanager/restart': Port;
  'litefm/list': Port & { relative_path: string };
  'litefm/get': Port & { relative_path: string };
  'litefm/save': Port & { relative_path: string; content: string };
};
