/// Variables and Set Up \\\

require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

/// Functions \\\

function log(message) {
    function log(message) {
    console.log(`=== Bot Log ===
        
${message}

===============`);
}
}

async function onMessageSent(message) {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong! 🏓');
    }
}

/// Initialization \\\

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