import { ExtendedClient } from "./types/ExtendedClient.js";
import 'dotenv/config';

const client = new ExtendedClient();

client.start();

export { client };
