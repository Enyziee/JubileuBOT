import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { CommandType, ComponentsButton, ComponentsModal, ComponentsSelect } from "./Command.js";
import { EventType } from "./Events.js";

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    public buttons: ComponentsButton = new Collection;
    public selects: ComponentsSelect = new Collection;
    public modals: ComponentsModal = new Collection;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates
            ],
        });
    }

    public start(): void {
        this.registerModules();
        this.registerEvents();
        this.login(process.env.token);
    }

    private registerModules() {
        const slashCommands: Array<ApplicationCommandDataResolvable> = new Array();

        const commandPath = path.join(__dirname, '..', 'commands');
        const condition = (file: string) => file.endsWith('.js');

        readdirSync(commandPath).filter(condition).forEach(async fileName => {

            const command: CommandType = (await import(`${commandPath}/${fileName}`))?.default;
            const { name, buttons, selects, modals } = command;

            if (name) {
                this.commands.set(name, command);
                slashCommands.push(command);

                if (buttons) buttons.forEach((run, key) => this.buttons.set(key, run));
                if (selects) selects.forEach((run, key) => this.selects.set(key, run));
                if (modals) modals.forEach((run, key) => this.modals.set(key, run));
            }
        });


        this.on("ready", () => this.registerCommands(slashCommands));
    }

    private registerCommands(commands: Array<ApplicationCommandDataResolvable>) {
        this.application?.commands.set(commands)
            .then(() => {
                console.log('Slash commands (/) definded');
            })
            .catch((error: Error) => {
                console.log(`An error occurred while trying to set the Slash Commands (/): \n${error}`);
            });
    }

    private registerEvents() {
        const eventPath = path.join(__dirname, '..', 'events');
        const condition = (file: string) => file.endsWith('.js');

        readdirSync(eventPath).filter(condition).forEach(async fileName => {
            const { name, once, run }: EventType<keyof ClientEvents> = (await import(`../events/${fileName}`)).default;

            if (name) (once) ? this.once(name, run) : this.on(name, run);
        });

    }
}