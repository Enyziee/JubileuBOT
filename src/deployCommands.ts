import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import path from "node:path";
import 'dotenv/config';
import { CommandType } from "./types/Command";

const commandPath = path.join(__dirname, 'commands');
const slashCommands: CommandType[] = [];
const commandsNames = readdirSync(commandPath).filter((file: string) => file.endsWith('.js'));
const rest = new REST().setToken(process.env.token!);


Promise.all(commandsNames.map((fileName) => {
    return import(`${commandPath}/${fileName}`);
})).then((resolvedCommands => {
    resolvedCommands.forEach((resCommand => {
        slashCommands.push(resCommand.default.default);
    }));

    console.log(slashCommands);
    postCommands(slashCommands);

})).catch(err => {
    console.log(err);
});


function postCommands(slashCommands: CommandType[]) {
    console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    rest.put(
        Routes.applicationGuildCommands(process.env.clientid!, process.env.guildid!),
        { body: slashCommands },
    ).then((data) => {
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }).catch(err => {
        console.log(err);
    });
}
