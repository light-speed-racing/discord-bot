import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import { Handler, On, IA, EventParams, SubCommand } from '@discord-nestjs/core';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ModalBuilder,
  TextInputBuilder,
  CommandInteraction,
  TextInputStyle,
  ClientEvents,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
} from 'discord.js';
import { IsModalInteractionGuard } from 'src/guard/is-modal-interaction.guard';
import { RegisterDto } from './register.dto';
import { Driver } from './driver.entity';
import { DriverService } from './driver.service';
import { userMention } from 'discord.js';

@SubCommand({
  name: 'register',
  description: 'Register yourself as a driver',
})
export class RegisterDriverSubCommand {
  private readonly logger = new Logger(RegisterDriverSubCommand.name);
  constructor(private readonly service: DriverService) {}

  @Handler()
  async register(interaction: CommandInteraction): Promise<void> {
    const entity = await this.service.findOneBy('id', interaction.user.id);

    if (entity) {
      await interaction.reply(
        `${entity.firstName} ${entity.lastName} (${userMention(interaction.user.id)}) is already registered`,
      );
      return;
    }
    const modal = new ModalBuilder().setTitle('Register yourself as driver').setCustomId(RegisterDriverSubCommand.name);

    const fields = [
      new TextInputBuilder()
        .setCustomId('steamId')
        .setLabel('Your SteamId')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Sxxxxxxxxxxxxxxxx')
        .setMinLength(17)
        .setMaxLength(17),

      new TextInputBuilder()
        .setCustomId('firstName')
        .setLabel('First name')
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId('lastName')
        .setLabel('Last name')
        .setStyle(TextInputStyle.Short)
        .setRequired(false),
    ];

    modal.addComponents(
      fields.map((component) => new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component)),
    );

    return await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(new IsModalInteractionGuard(RegisterDriverSubCommand.name))
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) dto: RegisterDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit() || modal.customId !== RegisterDriverSubCommand.name) {
      return;
    }

    this.logger.log(`Modal ${modal.customId} submit`);

    await this.service.createOrUpdate(new Driver({ ...dto, id: modal.user.id }));

    await modal.reply(`${userMention(modal.user.id)} has been registered`);
  }
}
