const { timeParsed } = require('../utils/utils');

module.exports = {
    name: 'interactionCreate',
    execute(interaction) {
        if (!interaction.isCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
        console.log(`${timeParsed()}Interaction triggered [${command.data.name}]`);
        command.execute(interaction);
    },
};