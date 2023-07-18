import { ApplicationCommandType } from "discord.js";
import { Command } from '../types/Command.js';

export default new Command({
    name: 'ping',
    description: 'ping',
    type: ApplicationCommandType.ChatInput,
    run({ interaction }) {
        interaction.reply({ ephemeral: true, content: 'pong' });
    },
});