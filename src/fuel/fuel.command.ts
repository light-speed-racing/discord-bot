import {
  Command,
  DiscordCommand,
  InjectDiscordClient,
  On,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Modal,
  ModalSubmitInteraction,
  showModal,
  TextInputComponent,
} from 'discord-modals';
import { Client, CommandInteraction, MessageEmbed } from 'discord.js';
import { BaseConfig } from '../config/base.config';
import { Config } from '../config/config.types';
import { FuelService } from './fuel.service';

@Command({
  name: 'fuel',
  description: 'Calculate how much fuel you need for a race',
})
export class FuelCommand implements DiscordCommand {
  private readonly logger = new Logger(FuelCommand.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly config: ConfigService<Config>,
    private readonly service: FuelService,
  ) {}

  private readonly modalId = 'fuel-command-modal';

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new Modal()
      .setCustomId(this.modalId)
      .setTitle('Fuel calculation')
      .addComponents(
        new TextInputComponent()
          .setCustomId('duration')
          .setLabel('Race length in minutes')
          .setStyle('SHORT')
          .setMinLength(2)
          .setMaxLength(3)
          .setPlaceholder('30, 60, 90, 120')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('lapTime')
          .setLabel('Average lap time (M:SS.MS)')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(8)
          .setPlaceholder('1:42.4')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('fuelUsage')
          .setLabel('Fuel usage (Liters pr. lap)')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(4)
          .setPlaceholder('3.2')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('safeLaps')
          .setLabel('Reserve laps (For safe fuel)')
          .setStyle('SHORT')
          .setPlaceholder('3')
          .setDefaultValue('3')
          .setRequired(true),
      );

    await showModal(modal, {
      client: this.client,
      interaction,
    });
  }

  @On('modalSubmit')
  async onModuleSubmit(modal: ModalSubmitInteraction) {
    const { logo } = this.config.get<BaseConfig>('base');

    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId === this.modalId) {
      const raceTime = Number(modal.getTextInputValue('duration'));
      const lapTime = modal.getTextInputValue('lapTime').replace(/,/g, '.');
      const fuelPerLap = Number(
        modal.getTextInputValue('fuelUsage').replace(/,/g, '.'),
      );
      const safeLaps = Number(modal.getTextInputValue('safeLaps'));

      const res = this.service.calculate({
        raceTime,
        lapTime,
        safeLaps,
        fuelPerLap,
      });

      await modal.reply({
        embeds: [
          new MessageEmbed()
            .setThumbnail(logo)
            .setTimestamp()
            .setAuthor({
              name: this.client.user.tag,
              iconURL: logo,
            })
            .setFooter({
              text: this.client.user.tag,
              iconURL: logo,
            })
            .setTitle('Fuel calculation')
            .addField('Race time', `${raceTime} min`, true)
            .addField('Avg. lap time', `${lapTime}`, true)
            .addField('Fuel per lap', `${fuelPerLap} L`, true)
            .addField('Est. no. of laps', `${res.laps}`, true)
            .addField('Min. fuel', `${res.fuel} L`, true)
            .addField(`Safe laps`, `${res.safeFuelLiter} L (${safeLaps} laps)`)
            .addField('Est. fuel for race', `${res.fuel} L`, true),
        ],
      });
    }
  }
}
