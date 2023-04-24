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
  userMention,
} from 'discord.js';
import { IsModalInteractionGuard } from 'src/guard/is-modal-interaction.guard';
import { Driver } from './driver.entity';
import { DriverService } from './driver.service';
import { UpdateDriverDto } from './update-driver.dto';

@SubCommand({
  name: 'update',
  description: 'Update your driver profile',
})
export class UpdateDriverSubCommand {
  private readonly logger = new Logger(UpdateDriverSubCommand.name);
  constructor(private readonly service: DriverService) {}

  @Handler()
  async register(interaction: CommandInteraction): Promise<void> {
    const entity = await this.service.findOneBy('id', interaction.user.id);

    if (!entity) {
      await interaction.reply('You are not registered yet');
      return;
    }
    const modal = new ModalBuilder().setTitle('Update your driver profile').setCustomId(UpdateDriverSubCommand.name);
    const firstName = new TextInputBuilder()
      .setCustomId('firstName')
      .setLabel('First name')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    if (entity.firstName) {
      firstName.setValue(entity.firstName ?? '');
    }

    const lastName = new TextInputBuilder()
      .setCustomId('lastName')
      .setLabel('Last name')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    if (entity.lastName) {
      lastName.setValue(entity.lastName ?? '');
    }

    const fields = [
      new TextInputBuilder()
        .setCustomId('steamId')
        .setLabel('Your SteamId')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Sxxxxxxxxxxxxxxxx')
        .setMinLength(17)
        .setMaxLength(17)
        .setValue(entity.steamId),
      firstName,
      lastName,
    ];

    modal.addComponents(
      fields.map((component) => new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component)),
    );

    return await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(new IsModalInteractionGuard(UpdateDriverSubCommand.name))
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) dto: UpdateDriverDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit() || modal.customId !== UpdateDriverSubCommand.name) {
      return;
    }

    this.logger.log(`Modal ${modal.customId} submit`);

    await this.service.createOrUpdate(new Driver({ id: modal.user.id, ...dto }));
    await modal.user.send('Your profile has been updated');
    await modal.reply(`${userMention(modal.user.id)}s profile has been updated`);
  }
}
