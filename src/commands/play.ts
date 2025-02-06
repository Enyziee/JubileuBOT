import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song"),
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply();
    },
};
