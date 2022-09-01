const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const Queue = require('../modules/Queue');
const { voiceConnectionDebug } = require('../config.json');


class MusicPlayer {

    constructor(guildId, voiceAdapterCreator) {
        this.guildId = guildId;
        this.voiceAdapterCreator = voiceAdapterCreator;

        this.isPlaying = false;
        this.audioPlayer = undefined;

        this.playlist = new Queue();
    }

    /**
     * It joins a voice channel, and if it doesn't exist, it creates a new one
     * @param channelId - The ID of the voice channel you want to join.
     */
    joinVoiceChannel(channelId) {

        if (getVoiceConnection(this.guildId) == undefined) {

            joinVoiceChannel({
                channelId: channelId,
                guildId: this.guildId,
                adapterCreator: this.voiceAdapterCreator,
                selfDeaf: 'false',
                debug: voiceConnectionDebug,
            });

        }
    }

    /**
     * It gets the next video in the queue, creates a stream from it, and then creates an audio
     * resource from that stream
     * @returns A resource object.
     */
    async getResource() {
        const videoInfo = this.playlist.dequeue();
        const stream = await play.stream_from_info(videoInfo);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
        });

        return resource;
    }

    /**
     * It creates an audio player, subscribes it to the voice connection, plays the resource, and then
     * when the resource is finished playing, it checks if the playlist is empty. If it's not empty, it
     * plays the next resource
     */
    async play() {

        const voiceConnection = getVoiceConnection(this.guildId);


        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        voiceConnection.subscribe(audioPlayer);

        audioPlayer.play(await this.getResource());

        this.isPlaying = true;

        audioPlayer.on('stateChange', (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                this.isPlaying = false;

                if (!this.playlist.isEmpty()) {
                    this.getResource().then(resource => {
                        audioPlayer.play(resource);
                    });
                }

            }
        });

    }

    nextSong() {
        console.log();
    }

    async addSong(videoInfo) {

        this.playlist.enqueue(videoInfo);
        console.log();
    }

}

/**
 * If the music player for the guild doesn't exist, create it and add it to the client's music players
 * @param {Client} client - The Discord.js client object.
 * @param {String} guildId - The ID of the guild the music player is for.
 * @param {voiceAdapterCreator} voiceAdapterCreator
 * @returns {MusicPlayer} The music player for the guild.
 */

function getMusicPlayer(client, guildId, voiceAdapterCreator) {
    if (client.musicPlayers.get(guildId) == undefined) {
        const musicPlayer = new MusicPlayer(guildId, voiceAdapterCreator);
        client.musicPlayers.set(guildId, musicPlayer);
    }

    return client.musicPlayers.get(guildId);


}

module.exports = { MusicPlayer, getMusicPlayer };
