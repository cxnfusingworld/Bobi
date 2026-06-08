const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType } = require('discord.js')
const path = require('path')
const fs = require('fs')

const selfieFolderPath = path.join(__dirname, "../assets/selfie")
const catSelfies = fs.readdirSync(selfieFolderPath)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selfie')
        .setDescription('gives you a cute pic of bobi')
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    async execute(interaction) {
        await interaction.deferReply()

        const randomImageName = catSelfies[Math.floor(Math.random() * catSelfies.length)]
        const fullFilePath = path.join(selfieFolderPath, randomImageName)

        const attachment = new AttachmentBuilder(fullFilePath)

        await interaction.editReply({
            files: [attachment]
        })
    },
}