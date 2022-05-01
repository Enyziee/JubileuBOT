const fs = require('node:fs');
const { Client, Intents, Collection } = require('discord.js');
const { testToken } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.command.get(interaction.commandName);

    if (!command) return;

    try { await command.execute(interaction); }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Aconteceu um erro durante a executação desse comando!', ephemeral: true });
    }
});

client.login(testToken);