import { CanActivate } from '@nestjs/common';
import inRange from 'lodash.inrange';
import random from 'lodash.random';

export class Likelihood implements CanActivate {
  constructor(private readonly percentage: number) {}

  canActivate(): boolean {
    if (!this.percentage) {
      return false;
    }
    const number = random(0, 100);
    const success = inRange(number, 0, this.percentage);

    return success;
  }
}
