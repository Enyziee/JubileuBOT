const { SlashCommandBuilder } = require('@discordjs/builders');
const { MusicPlayer } = require('../modules/MusicPlayer');

const { Interaction } = require('discord.js');

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
            player = client.players.get(guild.id);
        } else {
            player = new MusicPlayer(guild.id, guild.voiceAdapterCreator);
            client.players.set(guild.id, player);
        }

        player.joinVC(member.voice.channel.id);

        let videoInfo;
        let msg;

        try {
            if (player.playing == false) {
                videoInfo = await player.playNow(query);
                msg = 'Reproduzindo agora: ';
            } else {
                videoInfo = await player.addSong(query);
                msg = 'Adicionado a fila: ';
            }
        } catch (error) {
            try {
                interaction.reply(`Ocorreu um problema... \`${error.message}\``);
            } catch (error1) {
                console.log('problem');
            }
            return;
        }

        try {
            interaction.reply(`${msg} \`${videoInfo.video_details.title}\``);
        } catch (error) {
            console.error(error);
        }
    },
};