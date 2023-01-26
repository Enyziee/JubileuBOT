const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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
                selfDeaf: false,
                // debug: true,
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_00),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    this.destroy();
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
    }

    preparePlayer() {
        const connection = getVoiceConnection(this.guildId);

        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        connection.subscribe(this.player);

        this.player.on('stateChange', async (oldState, newState) => {

            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                if (!this.playlist.isEmpty()) {
                    await this.playNext();
                    return;
                }

                this.playing = false;
                setTimeout(this.timeout, 30000, this.guildId);
            }

            this.player.on('error', async () => {
                if (this.hasNext) {
                    await this.playNext();
                }
            });
        });
    }

    async playNow(query) {
        const info = await play.video_info(query);
        const resource = await this.createResource(info);

        this.preparePlayer();

        this.player.play(resource);
        this.playing = true;

        return info;
    }

    async playNext() {
        const nextInfo = this.playlist.dequeue();
        const resource = await this.createResource(nextInfo);

        this.player.play(resource);

        return nextInfo;
    }

    async createResource(videoInfo) {
        const source = await play.stream_from_info(videoInfo);
        const resource = createAudioResource(source.stream, {
            inputType: source.type,
        });

        return resource;
    }

    async addSong(query) {
        const info = await play.video_info(query);
        this.playlist.enqueue(info);

        return info;
    }

    hasNext() {
        return !this.playlist.isEmpty();
    }

    getPlaylist() {
        return this.playlist;
    }

    timeout(guildId) {
        const connection = getVoiceConnection(guildId);
        connection.destroy();
    }

    destroy() {
        const connection = getVoiceConnection(this.guildId);
        connection.destroy();
        this.playing = false;
        this.playlist.clear();
    }

}

module.exports = { MusicPlayer };