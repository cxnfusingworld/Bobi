const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

async function getFact() {

    // console.log("Command [fact]: Fetching data...")
    
    try {
        const response = await fetch('https://catfact.ninja/fact')
        const data = await response.json()        
        return data.fact 
    } catch (error) {
        console.warn("Command [fact]: Failed to fetch.", error)
        return null
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('gives u a fun cat fact')
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
        
    async execute(interaction) {
        await interaction.deferReply()
        const catFact = await getFact()
        await interaction.editReply({
            content: catFact || "uhhh i forgot 🤔",
        })
    },
}