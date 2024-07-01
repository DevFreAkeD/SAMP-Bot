const { EmbedBuilder } = require('discord.js');
const samp = require('samp-query');

module.exports = [
    {
        name: 'ping',
        description: 'Test Command: Replies with Pong!',
        async execute(client, message, args) {
            await message.reply('Pong!');
        }
    },
];
