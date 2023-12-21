import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { rootConfig } from 'src/config/config.module';

@Injectable()
export class ApiTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { authorization_token } = rootConfig.openGamePanel;
    const isLocalhost = req.get('Host').includes('localhost');

    const token = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`).searchParams.get('token');

    if (!isLocalhost && ![token, req.header('x-api-token')].includes(authorization_token)) {
      throw new UnauthorizedException();
    }

    next();
  }
}
