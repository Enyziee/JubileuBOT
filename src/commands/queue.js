const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra o que está na fila.'),

    /**
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        const player = interaction.client.players.get(interaction.guildId);

        if (!player) {
            interaction.reply('A fila está vazia');
            return;
        }

        const result = player.getPlaylist().toString();

        interaction.reply(result);
    },
};