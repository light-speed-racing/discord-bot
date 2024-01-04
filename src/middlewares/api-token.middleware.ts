import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { rootConfig } from 'src/config/config.module';

@Injectable()
export class ApiTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { authorization_token } = rootConfig.openGamePanel;
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    const token = (req.header('x-api-token') || req.header('x-authorization')) ?? url.searchParams.get('token');

    const isLocalhost = req.get('Host').includes('localhost');
    if (!isLocalhost && token !== authorization_token) {
      throw new UnauthorizedException();
    }

    next();
  }
}
