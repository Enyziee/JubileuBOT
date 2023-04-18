const { timeParsed } = require('../modules/utils');

module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (!interaction.isCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        command.execute(interaction);
        console.log(`${timeParsed()}Interaction triggered [${command.data.name}]`);
    },
};