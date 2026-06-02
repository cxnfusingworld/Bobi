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

async function getAttachment(index) {    
    const catPicture = await getPicture()
    if (!catPicture) return null

    const fileName = (index !== undefined) ? `cat_${index + 1}.png` : 'cat.png'
    const attachment = new AttachmentBuilder(catPicture, { name: fileName })
    
    return attachment
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat-picture')
        .setDescription('gives u a random cat picture')
        .addNumberOption(option => 
            option.setName("amount")
            .setDescription("amount of cat pics to send, max 5")
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction) {
        await interaction.deferReply()

        let amount = interaction.options.getNumber("amount") || 1
        amount = Math.min(Math.max(amount, 1), 5)

        let attachments = []

        for (let i = 0; i < amount; i++) {
            const newAttachment = await getAttachment(i)
            if (newAttachment) {
                attachments.push(newAttachment)
            }
        }
        
        if (attachments.length == 0) {
            return await interaction.editReply({ 
                content: "oops i lost the photos, try again in a bit 😭😭" 
            })
        }

        await interaction.editReply({
            files: attachments
        })
    },
}