import { DiscordGatewayAdapterCreator, joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnection, AudioPlayer } from '@discordjs/voice';

import play, { InfoData } from 'play-dl';
import Queue from '../modules/Queue';
import { timeParsed } from './utils';

class MusicPlayer {
    guildId: string;
    voiceAdapterCreator: DiscordGatewayAdapterCreator;
    playing: boolean;
    player: AudioPlayer;
    playlist: Queue;
    timeoutId: NodeJS.Timeout | undefined;

    constructor(guildId: string, voiceAdapterCreator: DiscordGatewayAdapterCreator) {
        this.guildId = guildId;
        this.voiceAdapterCreator = voiceAdapterCreator;

        this.playing = false;

        this.playlist = new Queue();

        this.player = this.audioPlayerCreator();
    }

    audioPlayerCreator(): AudioPlayer {
        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        player.on('stateChange', async (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                if (!this.playlist.isEmpty()) {
                    await this.playNext();
                    return;
                }

                console.log(`${timeParsed()}Start timeout counter`);
                this.playing = false;
                this.timeoutId = setTimeout(this.timeout, 30000, this.guildId);
            }
        });

        player.on('error', async () => {
            if (this.hasNext()) {
                await this.playNext();
            } else {
                this.destroy()
            }
        });

        return player;
    }

    /**
     * It joins a voice channel and if it disconnects, it tries to reconnect to the same channel
     * @param channelId - The ID of the voice channel to join
     */
    async joinVC(channelId: string) {

        let connection: VoiceConnection;
        if (!getVoiceConnection(this.guildId)) {
            connection = joinVoiceChannel({
                channelId: channelId,
                guildId: this.guildId,
                adapterCreator: this.voiceAdapterCreator,
                selfDeaf: false,
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
                this.destroy();
            });

            connection.subscribe(this.player);
        }
    }    

    async playNow(query: string) {
        const info = await play.video_info(query);
        const resource = await this.createResource(info);

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

    async createResource(videoInfo: InfoData) {
        const source = await play.stream_from_info(videoInfo);
        const resource = createAudioResource(source.stream, {
            inputType: source.type,
        });

        return resource;
    }

    async addSong(query: string) {
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

    timeout(guildId: string) {
        if (this.playing) {
            console.log(`${timeParsed()}Stil Playing`);
            return;
        }

        console.log(`${timeParsed()}Player timeout`);
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
        }
    }

    destroy() {
        const connection = getVoiceConnection(this.guildId);
        this.playing = false;
        this.playlist.clear();
        if (connection != undefined) {
            connection.destroy();
        }
    }
}

module.exports = { MusicPlayer };