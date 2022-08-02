const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { Interaction } = require('discord.js');
const Queue = require('../modules/Queue');
const play = require('play-dl');


function getGuildQueue(client, guildId) {
    if (client.guildsPlaylists.get(guildId) == undefined) {
        const playlist = new Queue();
        client.guildsPlaylists.set(guildId, playlist);
    }

    return client.guildsPlaylists.get(guildId);
}


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
     * @param {Interaction} interaction;
     */
    async execute(interaction) {

        const client = interaction.guild.client;
        const URL = interaction.options.data[0].value;
        let voiceConnection = getVoiceConnection(interaction.guildId);

        if (voiceConnection == undefined) {
            console.log('VoiceConnection não existe, criando uma nova!');
            voiceConnection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: 'false',
                debug: true,
            });
        }

        const guildPlaylist = getGuildQueue(client, interaction.guildId);

        if (!guildPlaylist.isEmpty()) {
            const videoInfo = await play.video_info(URL);
            guildPlaylist.enqueue(videoInfo);
            try {
                await interaction.reply(`Música adicionada a fila! ${videoInfo.video_details.title}`);
            }
            catch (error) {
                console.error(error);
            }
            return;
        }

        guildPlaylist.enqueue(await play.video_info(URL));

        const audioPlayer = createAudioPlayer({
            // behaviors: {
            //     noSubscriber: NoSubscriberBehavior.Play,
            // },
            debug: true,
        });

        const video_info = guildPlaylist.dequeue();
        const stream = await play.stream_from_info(video_info);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        audioPlayer.play(resource);

        voiceConnection.subscribe(audioPlayer);

        try {
            await interaction.reply(`Reproduzindo agora: ${video_info.video_details.title}`);
        }
        catch (error) {
            console.error(error);
        }

        // resource.on()

        audioPlayer.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
            // audioPlayer.play(getNextResource());
        });

        // audioPlayer.on('debug', message => {
        //     console.error(`Debug: ${message}`);
        //     // audioPlayer.play(getNextResource());
        // });

        voiceConnection.on('error', error => {
            console.error(`Error: ${error}`);
        });

        voiceConnection.on('debug', message => {
            console.error(`Debug: ${message}`);
        });


        audioPlayer.on('stateChange', (oldState, newState) => {
            console.log(`Audio player state change from ${oldState.status} to ${newState.status}`);

            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                console.log('next song');

                const nextSong = guildPlaylist.dequeue();

                if (nextSong == undefined) {
                    return;
                }

                play.stream_from_info(nextSong).then(stream1 => {
                    const resource1 = createAudioResource(stream1.stream, {
                        inputType: stream1.type,
                    });
                    audioPlayer.play(resource1);
                }).catch(error => {
                    console.log(error);
                });
            }

        });

    },
};