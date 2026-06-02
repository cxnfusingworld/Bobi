const { SlashCommandBuilder, InteractionContextType, AttachmentBuilder } = require('discord.js')

async function getPicture() {

    // console.log("Command [cat-picture]: Fetching data...")
    
    try {
        const response = await fetch('https://cataas.com/cat?json=true')
        const data = await response.json()
        return data.url
    } catch (error) {
        console.warn("Command [cat-picture]: Failed to fetch.", error)
        return null
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat-picture')
        .setDescription('gives u a random cat picture')
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
        
    async execute(interaction) {
        await interaction.deferReply()

        const catPicture = await getPicture()
        const attachment = new AttachmentBuilder(catPicture)

        await interaction.editReply({
            files: [attachment]
        })
    },
}