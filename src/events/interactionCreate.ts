import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../app.js";
import { Event } from "../types/Events.js";

export default new Event({
    name: "interactionCreate",
    run(interaction) {
        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        console.log(`Command [${command.name}] invoked`);
        const options = interaction.options as CommandInteractionOptionResolver;
        command.run({ client, interaction, options });
    },
});