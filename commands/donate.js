const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

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
            content: "## [donate](<https://www.roblox.com/games/138236517199900/Donations>) 🤑 🥹 ❤️",
            ephemeral: true,
        })
        
    },
} 