const fs = require('node:fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const token = process.env.token;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Comandos
client.commands = new Collection();
const commandPath = (__dirname + '/commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}


// Eventos
const eventsPath = (__dirname + '/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`${eventsPath}/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('error', error => {
    console.error(error);
});

client.musicPlayers = new Collection();

client.login(token);