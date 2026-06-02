const { SlashCommandBuilder, InteractionContextType, PermissionsBitField, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('makes the bot say smth in a specific channel')
        .addStringOption(option => 
            option.setName("message")
                .setDescription("the message to say")
                .setRequired(true)
        )
        // Added the channel picker option
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("where to send the message (defaults to here)")
                .addChannelTypes(ChannelType.GuildText) 
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

        const message = interaction.options.getString('message') || "🤔"
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel

        if (interaction.guild && targetChannel.id !== interaction.channel.id) {
            try {
                await targetChannel.send(message)
                return await interaction.reply({
                    content: `sure i sent that to <#${targetChannel.id}>`,
                    ephemeral: true
                })
            } catch (error) {
                return await interaction.reply({
                    content: `i cant talk in <#${targetChannel.id}> 😔💔`,
                    ephemeral: true
                })
            }
        }

        await interaction.deferReply()
        await interaction.editReply({
            content: message
        })
    },
}