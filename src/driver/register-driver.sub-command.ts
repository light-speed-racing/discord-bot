import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import { SubCommand, Handler, On, IA, EventParams } from '@discord-nestjs/core';
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
import { RegisterDriverDto } from './register-driver.dto';
import { Driver } from './driver.entity';
import { DriverService } from './driver.service';
import { userMention } from 'discord.js';
@SubCommand({
  name: 'register',
  description: 'Register yourself as a driver',
})
export class RegisterDriverSubcommand {
  constructor(private readonly service: DriverService) {}

  private readonly logger = new Logger(RegisterDriverSubcommand.name);
  private readonly modal = new ModalBuilder()
    .setTitle('Register yourself as a user')
    .setCustomId(RegisterDriverSubcommand.name);

  private readonly fields = [
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
      .setStyle(TextInputStyle.Short),

    new TextInputBuilder()
      .setCustomId('lastName')
      .setLabel('Last name')
      .setStyle(TextInputStyle.Short),
  ];

  @Handler()
  async register({ user, showModal, reply }: CommandInteraction): Promise<void> {
    const entity = await this.service.findOneBy('discordId', user.id);

    if (entity) {
      await reply(
        `${entity.firstName} ${entity.lastName} (${userMention(user.id)}) is already registered`,
      );
      return;
    }

    this.modal.addComponents(
      this.fields.map((component) =>
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(component),
      ),
    );

    showModal(this.modal);
  }

  @On('interactionCreate')
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) dto: RegisterDriverDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit() || modal.customId !== RegisterDriverSubcommand.name) {
      return;
    }

    this.logger.log(`Modal ${modal.customId} submit`);

    const entity = await this.service.createOrUpdate(
      new Driver({ ...dto, discordId: modal.user.id }),
    );

    await modal.reply(`${userMention(modal.user.id)} (${entity.firstName}) has been registered`);
  }
}
