import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv'
import Bot from './src/Bot.js';

dotenv.config()

const token = process.env.BOT_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // 

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.id}`);
    const bot = new Bot(c.user.id, c);
    bot.start();
});

// Log in to Discord with your client's token
client.login(token);