import { ApplicationCommandType, GuildMember } from "discord.js";
import { Command } from "../types/Command";
import { client } from "../app";

export default new Command({
    name: "stop",
    description: "Para a reprodução e se desconecta",
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

        player.destroy();
        client.players.delete(guild.id);

        await interaction.reply({ content: "Desconectado!" });
    }
});