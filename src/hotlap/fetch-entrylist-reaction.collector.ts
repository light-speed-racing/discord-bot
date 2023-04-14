import { Filter, InjectCauseEvent, InteractionEventCollector, On, Once } from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ChatInputCommandInteraction, SelectMenuInteraction } from 'discord.js';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 15000 })
export class FetchEntrylistInteractionCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
  ) {}

  @Filter()
  filter(interaction: SelectMenuInteraction): boolean {
    return this.causeInteraction.id === interaction.message.interaction.id;
  }

  @On('collect')
  async onCollect(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.update({
      content: 'A button was clicked!',
      components: [],
    });
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
