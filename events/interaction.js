module.exports = {
    name: 'interactionCreate',
    execute(interaction, client) {

        if (!interaction.isCommand()) return;
        const command = client.commands.get(interaction.commandName);
        command.execute(interaction);


        console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

    },
};