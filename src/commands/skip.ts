import { ApplicationCommandType, GuildMember } from "discord.js";
import { Command } from "../types/Command";
import { client } from "../app";

export default new Command({
    name: "skip",
    description: "Avança para o próximo vídeo",
    type: ApplicationCommandType.ChatInput,

    async run({ interaction }) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild!;

        if (!member.voice.channel) {
            await interaction.reply({ content: "Você não está em um canal de voz!", ephemeral: true });
            return;
        }

        const player = client.players.get(guild.id);

        if (player === undefined) {
            await interaction.reply({ content: "Não estou em um canal de voz!" });
            return;
        }

        if (!player.hasNextSong()) {
            await interaction.reply({ content: `A playlist está vazia`, ephemeral: true });
            return;
        }

        const info = await player.playNext();

        await interaction.reply({ content: `Indo para próxima música! \`${info.video_details.title}\`` });
    }
});