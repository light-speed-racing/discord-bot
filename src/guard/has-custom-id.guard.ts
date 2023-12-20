import { CanActivate, ExecutionContext } from '@nestjs/common';

export class HasCustomId implements CanActivate {
  private readonly customIds: string[];

  constructor(...customIds: string[]) {
    this.customIds = customIds;
  }

  canActivate(context: ExecutionContext): boolean {
    return this.customIds.includes(context.getArgByIndex(0).customId);
  }
}
