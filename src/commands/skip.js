const { SlashCommandBuilder } = require('@discordjs/builders');

const { Interaction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Avança para a próxima música'),

    /**
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        const client = interaction.client;
        const member = interaction.member;
        const player = client.players.get(interaction.guild.id);

        // verificar se o usuário está em um canal de voz
        if (member.voice.channel == null) {
            console.log('Membro não está em um canal de voz!');
            interaction.reply('Você não está em um canal de voz', ephemeral = true);
            return;
        }

        if (player == null) {
            interaction.reply('Não estou reproduzindo nada no momento.');
            return;
        }

        if (!player.hasNext()) {
            interaction.reply('Não tem nada na fila.');
            return;
        }


        const videoInfo = await player.playNext();

        await interaction.reply(`Reproduzindo agora: \`${videoInfo.video_details.title}\``);
    },
};