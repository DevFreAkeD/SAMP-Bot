const { EmbedBuilder,  } = require('discord.js');
const samp = require('samp-query');
const AsciiTable = require('ascii-table');

module.exports = [
    {
        name: 'ping',
        description: 'Test Command: Replies with Pong!',
        async execute(client, message, args) {
            const authorName = message.author.username;
    
            if (authorName === 'freaked_') {
                try {
                    await message.reply('Hi, FreAkeD!');
                } catch (error) {
                    console.error('Error replying to message:', error);
                }
            } else {
                try {
                    await message.reply(`You MF! <@${message.author.id}>!`);
                } catch (error) {
                    console.error('Error replying to message:', error);
                }
            }
        }
    },
    {
        name: 'bot',
        aliases: [],
        description: 'Displays information about the bot creator',
        execute: async (client, message, args) => {
            const embed = new EmbedBuilder();
            const color = await message.guild?.members.fetch(message.client.user.id).then(color => color.displayHexColor) || '#000000';{
                embed.setColor(color);
                embed.setDescription('This Bot is created by FreAkeD.');
                return message.channel.send({ embeds: [embed] });
            }
        }
    },
    {
        name: 'ip',
        aliases: ['serverip'],
        description: 'Shows IP address of a SA:MP Server',
        async execute(client, message, args) {
            if(!process.env.SAMP_SERVER_IP)
                return message.channel.send('Server IP is not set in the .env file!');

            const ip = process.env.SAMP_SERVER_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };

            const embed = new EmbedBuilder();
            const color = await message.guild?.members.fetch(message.client.user.id).then(color => color.displayHexColor) || '#000000';
            
            await samp(options, (error, query) => {
                if(error){
                    embed.setColor(color);
                    embed.setTitle('Server is offline');
                    embed.setDescription(`**IP:** \`${options.host}:${options.port}\``);
                    return message.channel.send({ embeds: [embed] });
                }
                else{
                    embed.setColor(color);
                    embed.setTitle('Server is online!');
                    embed.setDescription(`**IP:** \`${options.host}:${options.port}\``);
                    return message.channel.send({ embeds: [embed] });
                }
            });

            return;
        }
    },
    {
        name: 'players',
        aliases: ['player'],
        description: 'Lists all online players if the number of players is 100 or fewer',
        execute: async (client, message, args) => {
            if (!process.env.SAMP_Server_IP) {
                return message.channel.send('Server IP is not set in the .env file!');
            }

            const color = await message.guild?.members.fetch(message.client.user.id).then(color => color.displayHexColor) || '#000000';

            const ip = process.env.SAMP_Server_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };

            samp(options, (error, query) => {
                if (error) {
                    console.log(error);
                    const embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`${options.host}:${options.port}`)
                        .setDescription('Server is offline');

                    return message.channel.send({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`**${query['hostname']}**`);

                    if (query['online'] > 0) {
                        if (query['online'] > 100) {
                            embed.addFields({ name: 'PLAYERS LIST', value: '*Number of players is greater than 100. Cannot list them!*' });
                        } else if (query['players'].length === 0) {
                            embed.addFields({ name: 'PLAYERS LIST', value: '*No players online.*' });
                        } else {
                            const tables = [];

                            for (let i = 0; i < Math.ceil(query['online'] / 20); i++) {
                                const table = new AsciiTable().setHeading('ID', 'NICK', 'SCORE').setAlign(2, AsciiTable.RIGHT);
                                const start = i * 20;
                                const end = Math.min((i + 1) * 20, query['online']);

                                for (let j = start; j < end; j++) {
                                    if (query['players'][j] !== undefined) {
                                        table.addRow(query['players'][j]['id'], query['players'][j]['name'], query['players'][j]['score']);
                                    }
                                }

                                tables.push(table.toString());
                            }

                            tables.forEach((table, index) => {
                                embed.addFields({ name: `Page ${index + 1}`, value: '```\n' + table + '```' });
                            });
                        }
                    } else {
                        embed.addFields({ name: 'PLAYERS LIST', value: '*Server is empty.*' });
                    }

                    return message.channel.send({ embeds: [embed] });
                }
            });
        }
    },
    {
        name: 'server',
        aliases: ['serverinfo'],
        description: 'Displays informations about SA:MP Server',
        execute: async (client, message, args) => {
            if(!process.env.SAMP_SERVER_IP)
                return message.channel.send('Server IP is not set in the .env file!');

            const color = await message.guild?.members.fetch(message.client.user.id).then(color => color.displayHexColor) || '#000000';

            const ip = process.env.SAMP_SERVER_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };
        
            await samp(options, (error, query) => {
                if(error){
                    const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`${options.host}:${options.port}`)
                    .setDescription('Server is offline');
            
                    return message.channel.send({ embeds: [embed] });
                }
                else{
                const embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(`**${query['hostname']}**`)
                        .addFields(
                            {name: 'SERVER IP', value: `${options.host}:${options.port}`, inline: true},
                            {name: 'PLAYERS', value: `${query['online'] || 0}/${query['maxplayers'] || 0}`, inline: true},
                            {name: 'GAMEMODE', value: query['gamemode'] || '-', inline: true},
                            {name: 'MAP', value: query['rules']['mapname'] || '-', inline: true},
                            {name: 'TIME', value: query['rules']['worldtime'] || '-', inline: true},
                            {name: 'VERSION', value: query['rules']['version'] || '-', inline: true},
                            {name: 'WEBSITE', value: `[${query['rules']['weburl']}](https://${query['rules']['weburl'] || 'https://sa-mp.com'})`, inline: true}
                        );
        
                    return message.channel.send({ embeds: [embed] });
                }
            });
        }
    }
];