const { SlashCommandBuilder, AttachmentBuilder, InteractionContextType } = require('discord.js')
const path = require('path');

const attachments = []

for (const selfie in path.join(__dirname, "../assets", "selfie")) {
    attachments.push(selfie)
}

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
        const chosen = attachments[Math.floor(Math.random() * attachments.length)]
        interaction.reply({
            files: [chosen]
        })
    },
}