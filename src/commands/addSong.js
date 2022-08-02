const { SlashCommandBuilder } = require('@discordjs/builders');
const play = require('play-dl');
const Queue = require('../modules/Queue');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsong')
        .setDescription('queue test')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL')
                .setRequired(false),
        ),

    async execute(interaction) {

        const client = interaction.guild.client;
        const guildId = interaction.guildId;
        const URL = interaction.options.data[0].value;


        if (client.guildsPlaylists.get(guildId) == undefined) {
            const playlist = new Queue();
            client.guildsPlaylists.set(guildId, playlist);
        }

        const guildPlaylist = client.guildsPlaylists.get(guildId);

        if (!guildPlaylist.isEmpty()) {
            console.log('queue is not empty, adding song to de queue');
            const videoInfo = await play.video_info(URL);
            guildPlaylist.enqueue(videoInfo);
            return;
        }

        console.log('queue is empty');

        const videoInfo = await play.video_info(URL);
        guildPlaylist.enqueue(videoInfo);


        // await interaction.reply('a');
    },

};
