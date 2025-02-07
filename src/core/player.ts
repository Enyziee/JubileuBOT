import EventEmmiter from 'node:events';
import { type DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';

export class PlayerManager {
	private static readonly players = new Map<string, Player>();

	private constructor() {}

	public static addGuildPlayer(guildId: string, player: Player) {
		this.players.set(guildId, player);
	}

	public static getGuildPlayer(guildId: string): Player | undefined {
		return this.players.get(guildId);
	}

	public static deleteGuildPlayer(guildId: string) {
		this.players.delete(guildId);
	}
}

export class Player extends EventEmmiter {
	private readonly guildId: string;

	private readonly voiceAdaptor: DiscordGatewayAdapterCreator;

	public constructor(guildId: string, voiceAdaptor: DiscordGatewayAdapterCreator) {
		super();
		this.guildId = guildId;
		this.voiceAdaptor = voiceAdaptor;
	}

	public join(channelId: string) {
		const conn = joinVoiceChannel({
			channelId,
			guildId: this.guildId,
			adapterCreator: this.voiceAdaptor,

			// debug: true,
		});

		conn.on('error', (error) => console.error(error));
		conn.on('debug', (message) => console.log(message));
	}

	public quit() {
		const conn = getVoiceConnection(this.guildId);

		if (!conn) {
			console.log('Trying to disconnect from inexistent connection');
			return;
		}

		conn.destroy();
	}

	public play() {}

	public stop() {}

	public pause() {}

	public resume() {}
}
