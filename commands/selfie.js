const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType } = require('discord.js')

const catSelfies = fs.readdirSync('../assets/selfie')

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