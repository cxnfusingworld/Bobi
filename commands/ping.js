const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // This defines how it looks inside Discord's UI
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
        
    // This is what happens when someone runs it
    async execute(interaction) {
        // Instead of message.reply(), we use interaction.reply()
        await interaction.reply('Pong! 🏓');
    }
};