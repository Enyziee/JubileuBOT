const { SlashCommandBuilder } = require('discord.js');

const { Interaction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a reprodução e limpa a fila.'),

    /**
    * @param {Interaction} interaction
    */
    async execute(interaction) {
        interaction.reply('.');

        const client = interaction.client;

        const player = client.players.get(interaction.guildId);

        player.destroy();

    },
};