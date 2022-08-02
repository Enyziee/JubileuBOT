const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { Client } = require('discord.js');
const Queue = require('../modules/Queue');

function getGuildQueue(client, guildId) {
    if (client.guildsPlaylists.get(guildId) == undefined) {
        const playlist = new Queue();
        client.guildsPlaylists.set(guildId, playlist);
    }

    return client.guildsPlaylists.get(guildId);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Retorna infomação sobre a conexão'),
    /**
     * @param {Interaction} interaction;
     */
    async execute(interaction) {
        // const connection = getVoiceConnection(interaction.guild.id);

        const client = interaction.guild.client;
        const guildId = interaction.guildId;


        const queue = getGuildQueue(client, guildId);

        console.log(queue);

        try {
            await interaction.reply('connection');
        } catch (error) {
            console.log('i');
        }

    },
};