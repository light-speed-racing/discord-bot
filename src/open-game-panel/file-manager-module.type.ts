type Port = { port: number | string };

export type FileManagerModule = {
  'gamemanager/start': Port;
  'gamemanager/stop': Port;
  'gamemanager/restart': Port;
  'litefm/list': Port & { relative_path: string };
  'litefm/get': Port & { relative_path: string };
  'litefm/save': Port & { relative_path: string; contents: string };
};
