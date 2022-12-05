const { SlashCommandBuilder } = require('@discordjs/builders');
const { Interaction } = require('discord.js');
const { MusicPlayer } = require('../modules/MusicPlayer');
const play = require('play-dl');

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

        const client = interaction.client;
        const guild = interaction.guild;
        const member = interaction.member;
        const query = interaction.options.getString('url');


        // verificar se o usuário está em um canal de voz
        if (member.voice.channel == null) {
            console.log('Membro não está em um canal de voz!');
            interaction.reply('Você não está em um canal de voz', ephemeral = true);
            return;
        }

        // Verifica se a guilda já tem um player
        let player = null;

        if (client.players.get(guild.id)) {
            console.log('O servidor já tem um player, retornando ele...');
            player = client.players.get(guild.id);
        } else {
            console.log('O servidor não tem um player, criando um...');
            player = new MusicPlayer(guild.id, guild.voiceAdapterCreator);
            client.players.set(guild.id, player);
        }

        player.joinVoiceChannel(member.voice.channel.id);

        player.play(query);

        const videoInfo = await play.video_basic_info(query);

        try {
            interaction.reply(`Reproduzindo agora: \`${videoInfo.video_details.title}\``);
        } catch (error) {
            console.error(error);
        }
    },
};