import { CanActivate, Logger } from '@nestjs/common';
import inRange from 'lodash.inrange';
import random from 'lodash.random';

export class Likelihood implements CanActivate {
  private logger = new Logger(Likelihood.name);
  constructor(private readonly percentage: number) {}

  canActivate(): boolean {
    if (!this.percentage) {
      return false;
    }
    const number = random(0, 100);
    const success = inRange(number, 0, this.percentage);

    this.logger.log(`Likelihood is ${this.percentage}. Number is: ${number}. Success: ${success}`);

    return success;
  }
}
