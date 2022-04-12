import { Command } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { InteractionReplyOptions } from 'discord.js';
import { from } from 'rxjs';


@Injectable()
@Command({
    name: 'fuelcalculator',
    description: 'calculates the amound of fuel needed',
})

export class FuelcalculatorCommand {
      return{
          import {totalFuelneeded} from '@fuelcalculator/fuelcalculator.module';
      }
    
}