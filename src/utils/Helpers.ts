import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CommandType } from "../types/Command.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function readCommands(): Array<CommandType> {
    const commandPath = path.join(__dirname, '..', 'commands');
    const condition = (file: string) => file.endsWith('.js');
    const slashCommands: Array<CommandType> = new Array();

    readdirSync(commandPath).filter(condition).forEach(async fileName => {
        const command: CommandType = (await import(`${commandPath}/${fileName}`))?.default;
        
        console.log('a');
        

        slashCommands.push(command);
    });

    return slashCommands;
}
