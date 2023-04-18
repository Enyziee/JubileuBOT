const { SlashCommandBuilder } = require('discord.js');

const { CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a reprodução e limpa a fila.'),

    /**
    * @param {CommandInteraction} interaction
    */
    async execute(interaction) {
        interaction.reply('.');
        const client = interaction.client;
        const player = client.players.get(interaction.guildId);

        try {
            player.destroy();
        } catch (error) {
            console.error(error);
        }
    },
};