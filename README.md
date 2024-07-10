# SAMP-Bot
 
SAMP Bot is Discord Bot that displays informations about San Andreas Multiplayer Server.

## How To Install?
- Clone this repostory

     `git clone https://github.com/DevFreAkeD/SAMP-Bot.git`

- Install `npm` packages

     `npm install`

- Rename `.ENV.EXAMPLE` file to `.ENV`

- Open `.ENV` file and put there preferred `CMD_PREFIX`, `DISCORD_TOKEN(BOT_TOKEN)` and `SAMP_SERVER_IP` of a SAMP server

- Run Bot Using `node bot.js` command in Terminal.

## Commands
#### User Commands
- `ip` - Shows IP address of a SA:MP Server
- `server` - Displays informations about SA:MP Server
- `players` - Displays List of all Online Players.
- `ping` - Returns latency and Test Command to Test Bot.
- `bot` - Check Bot Credits.

#### Admin Commands
- `config` - command to change bot configurations such as `SAMP_SERVER_IP` and `Bot Name` include sub command `!config setip <SAMP SERVER IP>` and `!config botname <Bot Name>`.
- `setip` - Dynamically Change SAMP Server IP.
- `setbotname` - Dynamically Change Bot Name.
