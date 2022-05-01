const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com pong!'),
    async execute(interaction) {
        await interaction.reply('Pedro gay!');
    },
};