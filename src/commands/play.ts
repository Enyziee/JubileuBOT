import { type GuildMember, SlashCommandBuilder } from 'discord.js';
import { PlayerManager, Player } from '../core/player.ts';
import type { Command } from './index.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song from YouTube')
		.addStringOption((option) => option.setName('url').setDescription('Link to a YouTube video'))
		.toJSON(),
	async execute(interaction) {
		const guild = interaction.guild;
		const member = interaction.member as GuildMember;

		if (!guild) {
			throw new Error('Interaction guild is null for some fucking reason...');
		}

		if (!member.voice.channel) {
			await interaction.reply({ content: 'You are not in a voice channel' });
			return;
		}

		let player = PlayerManager.getGuildPlayer(guild.id);

		if (!PlayerManager.getGuildPlayer(guild.id)) {
			console.log('The guild dont have a Player, creation one');

			player = new Player(guild.id, guild.voiceAdapterCreator);
			PlayerManager.addGuildPlayer(guild.id, player);

			player.join(member.voice.channel.id);
		}

		await interaction.reply({ content: 'Starting playing' });
	},
} satisfies Command;
