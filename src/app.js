const fs = require('node:fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const token = process.env.token;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Command handling
client.commands = new Collection();
const commandPath = (__dirname + '/commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

console.log('Loading commands...');
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    } catch (error) {
        console.error(`An error ocoured when trying to load a command '${file}' -> [${error.message}]`);
    }
}

// Event handling
const eventsPath = (__dirname + '/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    try {
        const event = require(`${eventsPath}/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } catch (error) {
        console.error(`An error ocoured when trying to load a event '${file}' -> [${error.message}]`);
    }
}

client.on('error', error => {
    console.error(error);
});

// client.on('debug', message => {
//     console.debug(message);
// });

client.players = new Collection();

client.login(token);