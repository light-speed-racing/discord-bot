import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import { SubCommand, Handler, EventParams, IA, On } from '@discord-nestjs/core';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionRowBuilder,
  ClientEvents,
  CommandInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { RootConfig } from 'src/config/config';
import { IsModalInteractionGuard } from 'src/guard/is-modal-interaction.guard';
import { CreateHotlapServerDto } from './create-hotlap-server.dto';

@SubCommand({
  name: 'create',
  description: 'Create a hotlap championship',
})
export class CreateHotlapSubcommand {
  constructor(private readonly config: RootConfig) {}

  private readonly logger = new Logger(CreateHotlapSubcommand.name);
  private readonly modal = new ModalBuilder()
    .setTitle('Register yourself as a user')
    .setCustomId(CreateHotlapSubcommand.name);

  private readonly fields = [
    new TextInputBuilder().setCustomId('title').setLabel('Chasmpionship name').setStyle(TextInputStyle.Short),

    new TextInputBuilder()
      .setCustomId('ogpUrl')
      .setLabel('OGP url')
      .setValue(this.config.openGamePanelDefaults.url)
      .setStyle(TextInputStyle.Short),

    new TextInputBuilder()
      .setCustomId('ogpToken')
      .setLabel('OGP token')
      .setValue(this.config.openGamePanelDefaults.token)
      .setStyle(TextInputStyle.Short),

    new TextInputBuilder()
      .setCustomId('ogpIp')
      .setLabel('OGP game server IP')
      .setValue(this.config.openGamePanelDefaults.ip)
      .setStyle(TextInputStyle.Short),

    new TextInputBuilder()
      .setCustomId('ogpPort')
      .setLabel('OGP game server Port')
      .setValue(`${this.config.openGamePanelDefaults.port}`)
      .setStyle(TextInputStyle.Short),
  ];

  @Handler()
  async register(interaction: CommandInteraction): Promise<void> {
    this.modal.addComponents(
      this.fields.map((component) => new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component)),
    );

    interaction.showModal(this.modal);
  }

  @On('interactionCreate')
  @UseGuards(new IsModalInteractionGuard(CreateHotlapSubcommand.name))
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) dto: CreateHotlapServerDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit() || modal.customId !== CreateHotlapSubcommand.name) {
      return;
    }

    this.logger.log(`Modal ${modal.customId} submit`);

    this.logger.debug(dto);
  }
}
