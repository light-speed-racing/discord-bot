import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { rootConfig } from 'src/config/config.module';

export class AuthModalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const isLocalhost = request.get('Host').includes('localhost');

    if (isLocalhost || rootConfig.env === 'development') {
      return true;
    }

    return request.headers['X-Authorization'] === rootConfig.openGamePanel.authorization_token;
  }
}
