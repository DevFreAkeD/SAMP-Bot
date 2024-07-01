require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType, Collection, ChannelType } = require('discord.js');

// Check for necessary environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CMD_PREFIX) {
    console.error('Missing necessary environment variables. Please check your .env file.');
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

const CMD_PREFIX = process.env.CMD_PREFIX.toLowerCase(); // Define CMD_PREFIX

client.commands = new Collection(); // Initialize client.commands as a Collection

const commandModules = require('./utils/commands.js');
commandModules.forEach(command => {
    client.commands.set(command.name, command);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.toLowerCase().startsWith(CMD_PREFIX)) return;

    const args = message.content.slice(CMD_PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(client, message, args);
        logCommand(message, false);
    } catch (error) {
        logCommand(message, true);
        console.error(error);
        message.reply('An error occurred while executing the command.');
    }
});

function logCommand(message, isError) {
    const logType = isError ? '[ERROR]' : '[CMD]';
    const logContext = message.channel.type === ChannelType.DM ? '[DM]' : `[${message.guild.name}(${message.guild.id})]`;
    console.log(`${logType} ${logContext} ${message.author.tag}(${message.author.id}) | ${message.content}`);
}

client.once('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setActivity('SA-MP', { type: ActivityType.Competing });
});

client.on('warn', console.warn);
client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);