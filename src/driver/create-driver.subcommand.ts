import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import { SubCommand, EventParams, Handler, IA, On } from '@discord-nestjs/core';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionRowBuilder,
  ClientEvents,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalActionRowComponentBuilder,
} from 'discord.js';
import { IsModalInteractionGuard } from 'src/guard';
import { CreateDriverDtoModalSubmit } from './create-driver.dto';
import { DriverService } from './driver.service';

@SubCommand({
  name: 'create',
  description: 'Register yourself as a driver',
})
export class CreateDriverSubcommand {
  constructor(private readonly service: DriverService) {}

  private readonly logger = new Logger(CreateDriverSubcommand.name);
  private readonly modalId = CreateDriverSubcommand.name;

  @Handler()
  async handle(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setTitle('Register yourself').setCustomId(this.modalId);

    const steamIdInput = new TextInputBuilder()
      .setCustomId('steamId')
      .setLabel('What is your steam id')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Sxxxxxxxxxxxxxxxxx')
      .setMinLength(18)
      .setMaxLength(18)
      .setRequired(true);

    const rows = [steamIdInput].map((component) =>
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component),
    );
    modal.addComponents(...rows);

    await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(IsModalInteractionGuard)
  async onModalSubmit(
    @IA(ModalFieldsTransformPipe) dto: CreateDriverDtoModalSubmit,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;
    if (!modal.isModalSubmit()) return;

    if (modal.customId !== this.modalId) return;
    this.logger.log(`Modal ${modal.customId} submit`);
    this.logger.log(dto, modal.user.id);
  }
}
