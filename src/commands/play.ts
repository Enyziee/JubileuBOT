import { ApplicationCommandOptionType, ApplicationCommandType, GuildMember } from "discord.js";
import { client } from "../app.js";
import { Command } from "../types/Command.js";
import { MusicPlayer } from "../utils/MusicPlayer.js";

export default new Command({
    name: "play",
    description: "Reproduz um vídeo do Youtube",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "query",
        description: "Link do Youtube",
        required: true,
        type: ApplicationCommandOptionType.String
    }],

    async run({ interaction, options }) {
        const member = interaction.member as GuildMember;
        const guild = interaction.guild!;

        if (!member.voice.channel) {
            await interaction.reply({ content: "Você não está em um canal de voz!", ephemeral: true });
            return;
        }

        let player = client.players.get(guild.id);

        if (player == undefined) {
            player = new MusicPlayer(guild);
            client.players.set(guild.id, player);
            player.joinVoiceChannel(member.voice.channelId!);
        }

        player.on("destroy", () => {
            console.log("Event emitter: destroying player");
            client.players.delete(guild.id);
        });

        if (player.playing) {
            const info = await player.addToPlaylist(options.getString("query")!);
            await interaction.reply({ content: `Adicionado a fila: \`${info.video_details.title}\`` });
            return;
        }

        try {
            const info = await player.playNow(options.getString("query")!);
            await interaction.reply({ content: `Reproduzingo agora: \`${info.video_details.title}\`` });
        } catch (err) {
            player.destroy();
            if (err instanceof Error) {
                await interaction.reply({ content: `Ocorreu um problema: \`${err.message}\`` });
            }
            console.error(err);
        }
    }
});
