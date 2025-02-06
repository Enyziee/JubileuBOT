import { Client, IntentsBitField } from "discord.js";
import "dotenv/config";

const client = new Client({ intents: "GuildVoiceStates" });

client.login(process.env.DISCORD_TOKEN);
