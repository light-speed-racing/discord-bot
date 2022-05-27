export class Ftp {
  async connect(
    host: string,
    port: number,
    username: string,
    password: string,
  ) {}

  async disconnect() {}

  async upload(localPath: string, remotePath: string) {}
}
