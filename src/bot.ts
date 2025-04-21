import { Client, GatewayIntentBits } from 'discord.js';
import config from './config.json';
import registerMessageCreateHandler from './events/messageCreate';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

registerMessageCreateHandler(client);

console.log('Bot starting...');
client.login(config.token);
