import { AudioPlayer, AudioPlayerError, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Guild } from 'discord.js';
import playdl, { InfoData } from 'play-dl';
import Queue from './Queue.js';

import { EventEmitter } from 'events';

export class MusicPlayer extends EventEmitter {
    private playlist: Queue;
    private player: AudioPlayer | undefined;
    private guild: Guild;

    public playing: boolean;

    public constructor(guild: Guild) {
        super();
        this.playlist = new Queue();
        this.guild = guild;
        this.playing = false;
    }

    public joinVoiceChannel(channelId: string) {
        let connection = getVoiceConnection(this.guild.id);

        if (connection == undefined) {
            console.log('Creating new connection');
            connection = this.createVoiceConnection(channelId);
        } else {
            console.log('Using existent connection');
        }

        if (this.player == undefined) {
            console.log('Creating new player');
            this.player = this.createAudioPlayer();
        } else {
            console.log('Using existent player');
        }

        connection.subscribe(this.player);
    }

    public async playNow(query: string): Promise<InfoData> {
        const stream = await playdl.stream(query);
        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
            inlineVolume: false,
        });

        this.player?.play(resource);
        this.playing = true;

        const info = await playdl.video_basic_info(query);
        return info;
    }

    public async playNext(): Promise<InfoData> {
        const query: string | undefined = this.playlist.dequeue();

        if (query == undefined) {
            throw ("Nothing in playlist!");
        }

        const info = await this.playNow(query);
        return info;
    }

    public hasNextSong(): boolean {
        return !this.playlist.isEmpty();
    }

    public async addToPlaylist(query: string): Promise<InfoData> {
        // TODO: Criar validação pra inserir na playlist
        this.playlist.enqueue(query);
        const info = await playdl.video_basic_info(query);
        return info;
    }

    private createAudioPlayer(): AudioPlayer {
        console.log('Create Audio Player');
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
            debug: false,
        });

        audioPlayer.on('error', async (err: AudioPlayerError) => {
            console.error('PLAYER ERROR ', err.message);
            if (!this.playlist.isEmpty()) {
                await this.playNext();
                return;
            }

            this.destroy();
        });

        audioPlayer.on('debug', (msg: string) => {
            console.log('PLAYER DEBUG ', msg);
        });

        audioPlayer.on('stateChange', async (oldState, newState) => {
            if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
                if (!this.playlist.isEmpty()) {
                    await this.playNext();
                    return;
                }

                this.destroy();
            }
        });

        return audioPlayer;
    }

    private createVoiceConnection(channelId: string): VoiceConnection {
        console.log('Creating a new connection');
        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: this.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator,
            selfDeaf: false,
            debug: false,
        });

        // Disconnection Listener
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            }
            catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                console.log("Bot disconnected!");
                this.destroy();
            }
        });

        // Error Listener
        connection.on('error', (error: Error) => {
            console.error('CONN ERROR ', error.message);
        });

        connection.on('debug', (msg: string) => {
            console.error('CONN DEBUG ', msg);
        });

        return connection;
    }

    public destroy() {
        console.log('Destroying Player!');
        this.emit("destroy");

        this.playing = false;
        this.player?.stop();
        this.player = undefined;

        const connection = getVoiceConnection(this.guild.id);
        connection?.destroy();
    }
}
