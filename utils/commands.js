const { EmbedBuilder } = require('discord.js');
const samp = require('samp-query');
const AsciiTable = require('ascii-table');
const fs = require('fs');
const path = require('path');
const { hasAdminPermission } = require('./permission');
require('dotenv').config();

module.exports = [
    {
        name: 'ping',
        description: 'Test Command: Replies with Pong!',
        async execute(client, message, args) {
            const authorName = message.author.username;
            try {
                if (authorName === 'freaked_') {
                    await message.reply('Hi, FreAkeD! My Master.');
                } else {
                    await message.reply(`Hi... <@${message.author.id}>!`);
                }
            } catch (error) {
                console.error('Error replying to message:', error);
            }
        }
    },
    {
        name: 'bot',
        aliases: [],
        description: 'Displays information about the bot creator',
        async execute(client, message, args) {
            const embed = new EmbedBuilder();
            const color = await message.guild?.members.fetch(message.client.user.id).then(member => member.displayHexColor) || '#000000';
            embed.setColor(color);
            embed.setDescription('This Bot is created by FreAkeD.');
            return message.channel.send({ embeds: [embed] });
        }
    },
    {
        name: 'ip',
        aliases: ['serverip'],
        description: 'Shows IP address of a SA:MP Server',
        async execute(client, message, args) {
            if (!process.env.SAMP_SERVER_IP) {
                return message.channel.send('Server IP is not set in the .env file!');
            }

            const ip = process.env.SAMP_SERVER_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };

            const embed = new EmbedBuilder();
            const color = await message.guild?.members.fetch(message.client.user.id).then(member => member.displayHexColor) || '#000000';

            samp(options, (error, query) => {
                embed.setColor(color);
                if (error) {
                    embed.setTitle('Server is offline');
                    embed.setDescription(`**IP:** \`${options.host}:${options.port}\``);
                } else {
                    embed.setTitle('Server is online!');
                    embed.setDescription(`**IP:** \`${options.host}:${options.port}\``);
                }
                return message.channel.send({ embeds: [embed] });
            });
        }
    },
    {
        name: 'players',
        aliases: ['player'],
        description: 'Lists all online players if the number of players is 100 or fewer',
        async execute(client, message, args) {
            if (!process.env.SAMP_SERVER_IP) {
                return message.channel.send('Server IP is not set in the .env file!');
            }

            const color = await message.guild?.members.fetch(message.client.user.id).then(member => member.displayHexColor) || '#000000';
            const ip = process.env.SAMP_SERVER_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };

            samp(options, (error, query) => {
                const embed = new EmbedBuilder().setColor(color).setTitle(`${options.host}:${options.port}`);

                if (error) {
                    embed.setDescription('Server is offline');
                } else {
                    embed.setTitle(`**${query['hostname']}**`);
                    if (query['online'] > 0) {
                        if (query['online'] > 100) {
                            embed.addFields({ name: 'PLAYERS LIST', value: '*Number of players is greater than 100. Cannot list them!*' });
                        } else if (query['players'].length === 0) {
                            embed.addFields({ name: 'PLAYERS LIST', value: '*No players online.*' });
                        } else {
                            const tables = [];
                            for (let i = 0; i < Math.ceil(query['online'] / 50); i++) {
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
                }

                return message.channel.send({ embeds: [embed] });
            });
        }
    },
    {
        name: 'server',
        aliases: ['serverinfo'],
        description: 'Displays information about SA:MP Server',
        async execute(client, message, args) {
            if (!process.env.SAMP_SERVER_IP) {
                return message.channel.send('Server IP is not set in the .env file!');
            }

            const color = await message.guild?.members.fetch(message.client.user.id).then(member => member.displayHexColor) || '#000000';
            const ip = process.env.SAMP_SERVER_IP.split(':');
            const options = {
                host: ip[0],
                port: ip[1] || 7777
            };

            samp(options, (error, query) => {
                const embed = new EmbedBuilder().setColor(color);

                if (error) {
                    embed.setTitle(`${options.host}:${options.port}`);
                    embed.setDescription('Server is offline');
                } else {
                    embed.setTitle(`**${query['hostname']}**`)
                        .addFields(
                            { name: 'SERVER IP', value: `${options.host}:${options.port}`, inline: true },
                            { name: 'PLAYERS', value: `${query['online'] || 0}/${query['maxplayers'] || 0}`, inline: true },
                            { name: 'GAMEMODE', value: query['gamemode'] || '-', inline: true },
                            { name: 'MAP', value: query['rules']['mapname'] || '-', inline: true },
                            { name: 'TIME', value: query['rules']['worldtime'] || '-', inline: true },
                            { name: 'VERSION', value: query['rules']['version'] || '-', inline: true },
                            { name: 'WEBSITE', value: `[${query['rules']['weburl']}](https://${query['rules']['weburl'] || 'https://sa-mp.com'})`, inline: true }
                        );
                }

                return message.channel.send({ embeds: [embed] });
            });
        }
    },
    {
        name: 'config',
        description: 'Configures the bot settings',
        async execute(client, message, args) {
            if (!hasAdminPermission(message.member)) {
                return message.reply('You do not have permission to use this command.');
            }
    
            const subCommand = args[0];
            const newValue = args.slice(1).join(' ');

            if (!subCommand) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Configuration Help')
                    .setDescription('Use the following sub-commands to configure the bot:')
                    .addFields(
                        { name: '!config setip <ip>', value: 'Set the SA:MP server IP. Example: `!config setip 127.0.0.1:7777`' },
                        { name: '!config rename <new_name>', value: 'Rename the bot. Example: `!config botname Doraemon`' }
                    );
                return message.channel.send({ embeds: [embed] });
            }

            if (subCommand === 'setip') {
                if (!newValue) {
                    return message.channel.send('Please provide a valid IP address. Example: `!config setip 127.0.0.1:7777`');
                }
                process.env.SAMP_SERVER_IP = newValue;
                // Optionally, save to a .env file
                const envFilePath = path.resolve(__dirname, '../.env');
                let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
                envFileContent = envFileContent.replace(/SAMP_SERVER_IP=.*/g, `SAMP_SERVER_IP=${newValue}`);
                fs.writeFileSync(envFilePath, envFileContent);
                return message.channel.send(`Server IP has been set to \`${newValue}\``);
            } else if (subCommand === 'botname') {
                if (!newValue) {
                    return message.channel.send('Please provide a new bot name. Example: `!config botname Doraemon`');
                }
                try {
                    await client.user.setUsername(newValue);
                    return message.channel.send(`Bot username has been changed to \`${newValue}\``);
                } catch (error) {
                    console.error('Error renaming the bot:', error);
                    return message.channel.send('An error occurred while renaming the bot.');
                }
            } else {
                return message.channel.send('Unknown sub-command. Use `!config` to see available options.');
            }
        }
    },
    {
        name: 'setip',
        description: 'Sets the SA:MP server IP',
        async execute(client, message, args) {
            if (!hasAdminPermission(message.member)) {
                return message.reply('You do not have permission to use this command.');
            }
    
            const newIp = args[0];

            if (!newIp) {
                return message.channel.send('Please provide a valid IP address. Example: `!setip 127.0.0.1:7777`');
            }

            process.env.SAMP_SERVER_IP = newIp;

            // Optionally, save to a .env file
            const envFilePath = path.resolve(__dirname, '../.env');
            let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
            envFileContent = envFileContent.replace(/SAMP_SERVER_IP=.*/g, `SAMP_SERVER_IP=${newIp}`);
            fs.writeFileSync(envFilePath, envFileContent);

            return message.channel.send(`Server IP has been set to \`${newIp}\``);
        }
    },
    {
        name: 'setbotname',
        description: 'Renames the bot',
        async execute(client, message, args) {
            if (!hasAdminPermission(message.member)) {
                return message.reply('You do not have permission to use this command.');
            }
    
            const newName = args.join(' ');
    
            if (!newName) {
                return message.channel.send('Please provide a new bot name. Example: `!setbotname NewBotName`');
            }
    
            try {
                await client.user.setUsername(newName);
                return message.channel.send(`Bot username has been changed to \`${newName}\``);
            } catch (error) {
                console.error('Error renaming the bot:', error);
                return message.channel.send('An error occurred while renaming the bot.');
            }
        }
    }
];