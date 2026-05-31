require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new bot instance and give it permissions
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Run this code once when the bot successfully logs in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Run this code every time a message is sent in your server
client.on('messageCreate', async (message) => {
    // Stop the bot from responding to itself or other bots
    if (message.author.bot) return;

    // If a human types !ping, reply with Pong!
    if (message.content === '!ping') {
        await message.reply('Pong! 🏓');
    }
});

// Log the bot in using the secret token from your .env file
client.login(process.env.DISCORD_TOKEN);

// Tiny web server to keep Render happy on the free tier
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Goober is awake!');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});