import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { rootConfig } from 'src/config/config.module';

export class AuthModalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (rootConfig.env === 'development') {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();

    return request.headers['X-Authorization'] === rootConfig.openGamePanel.authorizationToken;
  }
}
