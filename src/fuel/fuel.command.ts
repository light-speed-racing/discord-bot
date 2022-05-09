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
import {
  Client,
  CommandInteraction,
  Formatters,
  MessageEmbed,
} from 'discord.js';
import { BaseConfig } from 'src/config/base.config';
import { Config } from 'src/config/config.types';
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
          .setDefaultValue('30')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('lapTime')
          .setLabel('Average lap time (M:SS)')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(8)
          .setPlaceholder('1:42.4')
          .setDefaultValue('1:42,4')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('fuelUsage')
          .setLabel('Fuel usage (Liters pr. lap)')
          .setStyle('SHORT')
          .setMinLength(3)
          .setMaxLength(4)
          .setPlaceholder('3.2')
          .setDefaultValue('3,2')
          .setRequired(true),

        new TextInputComponent()
          .setCustomId('stintCount')
          .setLabel('Number of stints')
          .setStyle('SHORT')
          .setPlaceholder('2')
          .setDefaultValue('1')
          .setRequired(false),

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
      const duration = Number(modal.getTextInputValue('duration'));
      const lapTime = modal.getTextInputValue('lapTime').replace(/,/g, '.');
      const usage = Number(
        modal.getTextInputValue('fuelUsage').replace(/,/g, '.'),
      );
      const stintCount = Number(modal.getTextInputValue('stintCount'));
      const safeLaps = Number(modal.getTextInputValue('safeLaps'));

      const res = this.service.calculate({
        duration,
        lapTime,
        safeLaps,
        usage,
        stintCount,
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
            .addField('Race time', `${duration} min`, true)
            .addField('Avg. lap time', `${lapTime}`, true)
            .addField('Fuel per lap', `${usage} L`, true)
            .addField('Pitstop no.', `${stintCount}`, true)
            .addField('Est. no. of laps', `${res.laps}`, true)
            .addField(
              `Safe laps (${res.safeFuelPercentage}%)`,
              `${safeLaps} (${res.safeFuelLiter} L)`,
            )
            .addField('Est. fuel for race', `${res.fuel} L`, true)
            .addField('Est. fuel per stint', `${res.fuelPrStint} L`, true),
        ],
      });
    }
  }
}
