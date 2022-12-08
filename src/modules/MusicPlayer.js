const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const Queue = require('../modules/Queue');

class MusicPlayer {
    constructor(guildId, voiceAdapterCreator) {
        this.guildId = guildId;
        this.voiceAdapterCreator = voiceAdapterCreator;

        this.playing = false;
        this.player = null;

        this.playlist = new Queue();
    }

    /**
     * It joins a voice channel and if it disconnects, it tries to reconnect to the same channel
     * @param channelId - The ID of the voice channel to join
     */
    async joinVC(channelId) {

        let connection = getVoiceConnection(this.guildId);

        if (connection == undefined) {
            connection = joinVoiceChannel({
                channelId: channelId,
                guildId: this.guildId,
                adapterCreator: this.voiceAdapterCreator,
                // debug: true,
            });
        }

        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_00),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
            }
        });

        connection.on('error', error => {
            console.error(error);
            connection.destroy();
        });

        connection.on('debug', msg => {
            console.log(`[DEBUG] ${msg}`);
        });
    }

    preparePlayer() {
        const connection = getVoiceConnection(this.guildId);
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        connection.subscribe(this.player);
    }

    async playNow(query) {
        this.preparePlayer();

        const source = await play.stream(query);

        const resource = createAudioResource(source.stream, {
            inputType: source.type,
        });

        this.player.play(resource);
        this.playing = true;

        const info = await play.video_basic_info(query);
        return info;
    }

    async playNext() {
        const data = await this.getNextSong();
        this.player.play(data[1]);

        return data[0];
    }

    async getNextSong() {
        const info = this.playlist.dequeue();
        const source = await play.stream_from_info(info);
        const resource = createAudioResource(source.stream, {
            inputType: source.type,
        });

        const data = [source, resource];

        return data;
    }

    getQueue() {
        // TO DO
    }

    async addSong(query) {
        const info = await play.video_basic_info(query);
        this.playlist.enqueue(info);

        return info;
    }

    destroy() {
        const connection = getVoiceConnection(this.guildId);
        connection.destroy();
    }

}

module.exports = { MusicPlayer };