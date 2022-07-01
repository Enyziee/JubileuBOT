const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Teixeira gay'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);

        console.log(connection);

        connection.destroy();
    },
};
