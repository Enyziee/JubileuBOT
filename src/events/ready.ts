import { client } from '../app.js';
import { Event } from "../types/Events.js";


export default new Event({
    name: "ready",
    once: true,
    run() {
        const { commands, buttons, selects, modals } = client;

        console.log(`Logged with ${client.user?.username}`);
        console.log(`Commands loaded: ${commands.size}`);
        console.log(`Buttons loaded: ${buttons.size}`);
        console.log(`Select Menus loaded: ${selects.size}`);
        console.log(`Modals loaded: ${modals.size}`);
    },
});