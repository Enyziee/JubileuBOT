/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import fs from 'node:fs';
import { ApplicationCommand, Client, Collection, GatewayIntentBits } from 'discord.js';
import { timeParsed } from './utils/utils';
import { MusicPlayer } from './utils/MusicPlayer';

require('dotenv').config();
const token = process.env.tokenTest;

export const client = Object.assign(
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildVoiceStates,
        ],
    }),
    {
        commands: new Collection<string, ApplicationCommand>(),
        players: new Collection<string, MusicPlayer>(),
    },
);

// Command handling
client.commands = new Collection();
const commandPath = (__dirname + '/commands');
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));

console.log(`${timeParsed()}Loading commands...`);
for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`${timeParsed()}An error ocoured when trying to load a command '${file}' -> [${error.message}]`);
        }
        else {
            console.error('Error');
        }
    }
}

// Event handling
console.log(`${timeParsed()}Loading events...`);
const eventsPath = (__dirname + '/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    try {
        const event = require(`${eventsPath}/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(`${timeParsed()}An error ocoured when trying to load a event '${file}' -> [${err.message}]`);
        }
        else {
            console.log('gay');
        }
    }
}

client.on('error', error => {
    console.error(error);
});

client.login(token);
