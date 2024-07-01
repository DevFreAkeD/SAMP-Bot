require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN environment variable. Please check your .env file.');
    process.exit(1);
}

const client = new Client({
    failIfNotExists: false,
    partials: [Partials.Channel],
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setActivity('SA-MP', { type: ActivityType.Competing });
});

client.on('warn', console.warn);
client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);