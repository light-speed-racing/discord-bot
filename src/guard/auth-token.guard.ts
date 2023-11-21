import { CanActivate, ExecutionContext } from '@nestjs/common';

// @TODO: Implement this
export class AuthModalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
