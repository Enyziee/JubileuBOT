import { ActionRowBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, Collection, Guild, GuildMember } from "discord.js";
import { Command } from "../types/Command.js";
import { MusicPlayer } from "../utils/MusicPlayer.js";
import { client } from "../app.js";

export default new Command({
    name: "play",
    description: "play a song",
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: "query",
        description: "url",
        required: true,
        type: ApplicationCommandOptionType.String
    }],

    run({ interaction, options }) {

        const member = interaction.member as GuildMember;
        const guild = interaction.guild!;

        let player = client.players.get(guild.id);

        if (!member.voice.channel) {
            interaction.reply({ content: "Sem voice channel!" });
            return;
        }

        if (player == undefined) player = new MusicPlayer(guild);

        player.joinVoiceChannel(member.voice.channelId!);

        const stopButton = new ButtonBuilder()
            .setCustomId("stopButton")
            .setLabel("Stop")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([stopButton]);


        interaction.reply({ ephemeral: true, content: "pong", components: [row] });
    },
    buttons: new Collection([
        ["stopButton", async (interaction) => {
            const member = interaction.member as GuildMember;

            const player = client.players.get(interaction.guildId!);
            player?.destroy();

            interaction.update({ components: [] });
        }]
    ])
});

function getGuildPlayer(guild: Guild) {
    let player = client.players.get(guild.id);

    if (player == undefined) {
        player = new MusicPlayer(guild);
        client.players.set(guild.id, player);
    }

    return player;
}
