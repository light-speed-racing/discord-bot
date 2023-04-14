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
import { Hotlap } from './hotlap.entity';
import { HotlapService } from './hotlap.service';

@SubCommand({
  name: 'create',
  description: 'Create a hotlap championship',
})
export class CreateHotlapSubcommand {
  constructor(private readonly config: RootConfig, private readonly service: HotlapService) {}

  private readonly logger = new Logger(CreateHotlapSubcommand.name);
  private readonly modal = new ModalBuilder()
    .setTitle('Create a hotlap server')
    .setCustomId(CreateHotlapSubcommand.name);

  private readonly fields = [
    new TextInputBuilder().setCustomId('title').setLabel('Chasmpionship name').setStyle(TextInputStyle.Short),
    new TextInputBuilder().setCustomId('entrylistUrl').setLabel('Entrylist URL').setStyle(TextInputStyle.Short),
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
  ): Promise<string> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit() || modal.customId !== CreateHotlapSubcommand.name) {
      return;
    }

    this.logger.log(`Modal ${modal.customId} submit`);
    const data = new Hotlap({
      ...dto,
      openGamePanelData: {
        ip: this.config.openGamePanelDefaults.ip,
        port: this.config.openGamePanelDefaults.port,
        token: this.config.openGamePanelDefaults.token,
        url: this.config.openGamePanelDefaults.url,
      },
    });

    const entity = await this.service.createOrUpdate(data);
    this.logger.verbose(`Hotlap > ${entity?.id}, ${entity.title}`);

    return !entity.id ? 'Could not create the hotlap' : 'Hotlap created';
  }
}
