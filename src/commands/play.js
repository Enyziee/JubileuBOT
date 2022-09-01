const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const { Interaction, Client, Collection } = require('discord.js');
const play = require('play-dl');
const { getMusicPlayer } = require('../modules/MusicPlayer');
const { voiceConnectionDebug } = require('../config.json');





module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL pra busca')
                .setRequired(true),
        ),
    /**
     * @param {Interaction} interaction
     */
    async execute(interaction) {

        const client = interaction.guild.client;
        const query = interaction.options.data[0].value;
        const player = getMusicPlayer(client, interaction.guildId, interaction.guild.voiceAdapterCreator);
        let response;


        if (!interaction.member.voice.channelId) {
            interaction.reply('Você não está em um canal de voz!');
            return;
        }

        if (play.yt_validate(query) === 'video') {

            player.joinVoiceChannel(interaction.member.voice.channelId);

            const videoInfo = await play.video_info(query);

            console.log(videoInfo);

            await player.addSong(videoInfo);

            if (player.isPlaying) {
                interaction.reply('Música adicionada a fila!');
                return;
            }

            await player.play();

            response = (`Começando a tocar: ${videoInfo.video_details.title}`);
        } else if (play.yt_validate(query) === 'playlist') {
            response = ('Playlists ainda não estão disponíveis :(');
        } else if (play.yt_validate(query) === 'search') {
            response = ('Buscas ainda não estão disponíveis :(');
        }

        const voiceConnection = getVoiceConnection(interaction.guildId);




        if (voiceConnectionDebug === 'true') {
            voiceConnection.on('debug', message => {
                console.log('Voice Connection Debug: ' + message);
            });
        }

        try {
            interaction.reply(response);
        } catch (error) {
            console.error(error);
        }

    },
};