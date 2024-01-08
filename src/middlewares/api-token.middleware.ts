import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { rootConfig } from 'src/config/config.module';

@Injectable()
export class ApiTokenMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiTokenMiddleware.name);

  use(req: Request, _: Response, next: NextFunction) {
    const { authorization_token } = rootConfig.openGamePanel;
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const token = req.header('x-api-token') || url.searchParams.get('token');

    if (!token || token !== authorization_token) {
      this.logger.error(
        'Request was rejected. The API KEY was not provided. User `X-Api-Token` header or `token` query param',
        {
          from: req.header('x-forwarded-for') || req.socket.remoteAddress,
          date: new Date().toISOString(),
          isLocalhost: req.get('Host').includes('localhost'),
          token,
          url: `${req.originalUrl}`,
        },
      );
      throw new UnauthorizedException();
    }

    next();
  }
}
