import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import { Command, EventParams, Handler, IA, InjectDiscordClient, On } from '@discord-nestjs/core';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionRowBuilder,
  Client,
  ClientEvents,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ModalActionRowComponentBuilder,
} from 'discord.js';
import { IsModalInteractionGuard } from 'src/guard';
import { FuelCalculatorDto } from './fuel-calculator.dto';
import { FuelService } from './fuel.service';

@Command({
  name: 'fuel',
  description: 'Calculate how much fuel you need for a race',
})
export class FuelCommand {
  private readonly logger = new Logger(FuelCommand.name);
  private readonly modalId = 'fuel-command-modal';

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly service: FuelService,
  ) {}

  @Handler()
  async onRegisterCommand(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle('Fuel calculation').setCustomId(this.modalId);

    const durationInput = new TextInputBuilder()
      .setCustomId('duration')
      .setLabel('Race length in minutes')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(3)
      .setPlaceholder('30, 60, 90, 120')
      .setRequired(true);

    const lapTimeInput = new TextInputBuilder()
      .setCustomId('lapTime')
      .setLabel('Average lap time (M:SS.MS)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(8)
      .setPlaceholder('1:42.4')
      .setRequired(true);

    const fuelUsageInput = new TextInputBuilder()
      .setCustomId('fuelUsage')
      .setLabel('Fuel usage (Liters pr. lap)')
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(4)
      .setPlaceholder('3.2')
      .setRequired(true);

    const safeLapsInput = new TextInputBuilder()
      .setCustomId('safeLaps')
      .setLabel('Reserve laps (For safe fuel)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('3')
      .setValue('3')
      .setRequired(true);

    const rows = [durationInput, lapTimeInput, fuelUsageInput, safeLapsInput].map((component) =>
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component),
    );

    modal.addComponents(...rows);

    await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) { duration, fuelUsage, lapTime, safeLaps }: FuelCalculatorDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit()) return;

    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId !== this.modalId) return;

    const res = this.service.calculate({
      raceTime: Number(duration.value),
      lapTime: lapTime.value.replace(/,/g, '.'),
      safeLaps: Number(safeLaps.value),
      fuelPerLap: Number(fuelUsage.value),
    });

    await modal.reply({
      embeds: [
        new EmbedBuilder()
          .setTimestamp()
          .setAuthor({ name: this.client.user.tag })
          .setFooter({ text: this.client.user.tag })
          .setTitle('Fuel calculation')
          .addFields([
            { name: 'Race time', value: `${duration.value} min`, inline: true },
            { name: 'Avg. lap time', value: `${duration.value} min`, inline: true },
            { name: 'Fuel per lap', value: `${fuelUsage.value} L`, inline: true },
            { name: 'Est. no. of laps', value: `${res.laps}`, inline: true },
            { name: 'Min. fuel', value: `${res.fuel} L`, inline: true },
            {
              name: `Safe laps`,
              value: `${res.safeFuelLiter} L (${res.safeLaps} inline: laps)`,
            },
            {
              name: 'Est. fuel for race',
              value: `${res.fuel} L`,
              inline: true,
            },
          ]),
      ],
    });
  }
}
