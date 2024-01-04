import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RootConfig } from 'src/config/config';

@Controller('health')
export class HealthController {
  constructor(
    private readonly config: RootConfig,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return {
      env: this.config.env,
      port: this.config.port,
      time: new Date().toISOString(),
      ...(await this.health.check([
        () => this.http.pingCheck('internet connection', 'https://google.com'),
        () => this.http.pingCheck('open-game-panel', `http://${this.config.openGamePanel.ip}`),
        () => this.db.pingCheck('database'),
      ])),
    };
  }
}
