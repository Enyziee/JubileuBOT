import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';

import { client } from '../app';
import { MusicPlayer } from '../utils/MusicPlayer';

import playdl from 'play-dl';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption((option) =>
            option.setName('url').setDescription('URL pra busca').setRequired(true),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const query: string = interaction.options.getString('url')!;
        const validation: false | string = playdl.yt_validate(query);
        let player = client.players.get(member.guild.id);

        if (member.voice.channelId == null) {
            await interaction.reply({ content: 'Você não está em um canal de voz!', ephemeral: true });
            return;
        }

        if (player == undefined) {
            console.log('Guild not have a player, creating one');
            player = new MusicPlayer(member.guild);
            client.players.set(member.guild.id, player);
        }

        if (player.playing) {
            const info = await player.addToPlaylist(query);
            await interaction.reply({ content: `Adicionado a fila ${info.video_details.title!}` });
            return;
        }

        player.joinVoiceChannel(member.voice.channelId);
        const info = await player.playNow(query);
        await interaction.reply({ content: `Reproduzindo agora ${info.video_details.title!}` });

    },
};
