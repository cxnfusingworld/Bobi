/// Variables and Set Up \\\

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs'); // Built-in Node.js module to read files
const path = require('path'); // Built-in module to handle file paths safely

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = {};
const commandPrefix = "!"

/// Functions \\\

function log(message) {
    console.log(`=== Bot Log ===\n\n${message}\n\n===============`);
}

// This function scans your folder and loads everything automatically
function initCommands() {
    log('Initializing Commands...');

    const commandsPath = path.join(__dirname, 'commands');
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        
        const command = require(filePath);
        
        commands[command.name] = command;
        
        console.log(`Loaded command: ${command.name}`);
    }
    
    log('All commands loaded successfully!');
}

async function onMessageSent(message) {
    if (message.author.bot) return;

    const command = commandPrefix+commands[message.content];

    if (command) {
        try {
            await command.execute(message);
        } catch (error) {
            console.error(`Error running command ${message.content}:`, error);
            await message.reply('There was an error trying to execute that command! ❌');
        }
    }
}

/// Initialization \\\

// Load commands before the bot hooks up to Discord
initCommands();

// Events
client.on('messageCreate', onMessageSent);

client.once('ready', () => {
   log(`Logged in as ${client.user.tag}!`);
});

// Login
client.login(process.env.DISCORD_TOKEN);

// Uptime Handler
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot Online');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});