const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js')
const emojis = require('../assets/emojis.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('gimme money 🥹')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ]),
    async execute(interaction) {
        await interaction.reply({
            content: `## [donate](<https://www.roblox.com/games/138236517199900/Donations>) 🥹 ${emojis.heart}`,
            flags: MessageFlags.Ephemeral,
        })
        
    },
} 