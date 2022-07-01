const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('gay'),
    async execute(interaction) {

        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        console.log(connection);
        // const connections = getVoiceConnection(interaction.guild.id);

        await interaction.reply(`Conectado ao canal ${interaction.member.voice.name}`);
    },
};