// FIXED: Added PermissionsBitField to the import list
const { SlashCommandBuilder, InteractionContextType, PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('says the same thing u say')
        .addStringOption(option => 
            option.setName("message")
                .setDescription("the message to say")
                .setRequired(true)
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction) {
        let allowedToUse = false

        if (interaction.member && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            allowedToUse = true
        }
        
        if (!interaction.guild) {
            allowedToUse = true
        }
        
        if (!allowedToUse) {                
            return await interaction.reply({
                content: 'u cant use this command <a:no:1511098533984604171>',
                ephemeral: true
            })
        }

        await interaction.deferReply()

        const message = interaction.options.getString('message') || "🤔"

        await interaction.editReply({
            content: message
        })
    },
}