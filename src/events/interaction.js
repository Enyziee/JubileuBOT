module.exports = {
    name: 'interactionCreate',
    execute(interaction) {

        if (!interaction.isCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        command.execute(interaction);

        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction. [${command.data.name}]`);

    },
};