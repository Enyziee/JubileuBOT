import type { SlashCommandBuilder } from "discord.js";

export type SlashCommand = {
    data: SlashCommandBuilder;
    async();
};
