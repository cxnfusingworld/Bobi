const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    InteractionContextType, 
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js')

const embedColor = '#7289da'
const widthStretcher = "**\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003**"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discord')
        .setDescription('cool stuff with discord')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ])
        
        // Server Info Subcommand
        .addSubcommand(subcommand =>
            subcommand.setName('server-info')
                .setDescription('get info abt the server')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand()

        // Server Info Subcommand
        if (sub === 'server-info') {
            if (!interaction.inGuild()) {
                return await interaction.reply({
                    content: 'server-info only works in servers mb 💔💔',
                    ephemeral: true
                })
            }
            
            await interaction.deferReply()

            // Info

            const guild = interaction.guild

            const name = guild.name
            const desc = guild.description || "*no description 💔*"
            
            const owner = guild.ownerId
            const memberCount = guild.memberCount

            const icon = guild.iconURL({ dynamic: true, size: 256 })
            const thumbnail = guild.bannerURL({ dynamic: true })
            
            const creationDate = Math.floor(guild.createdAt/1000)
            
            const channels = await guild.channels.fetch()
            const totalChannels = channels.size
            const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size
            const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size
            const forumChannels = channels.filter(c => c.type === ChannelType.GuildForum).size

            // Embeds

            let embeds = []
            const mainEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(name)
                .setDescription(`${desc}\n${widthStretcher}`)
            const membersEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Members')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Owner', value: `<@${owner}>`, inline: true },
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                ])
            const channelsEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Channels')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'All Channels', value: `${totalChannels}`, inline: true },
                    { name: 'Text Channels', value: `${textChannels}`, inline: true },
                    { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                    { name: 'Forum Channels', value: `${forumChannels}`, inline: true },
                ])
            const datesEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Dates')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Created', value: `<t:${creationDate}:f> (<t:${creationDate}:R>)`, inline: true },
                ])

            embeds.push(mainEmbed, membersEmbed, channelsEmbed, datesEmbed)

            let componentRow = null

            if (icon || thumbnail) {

                let buttons = []

                if (icon) {
                    const viewIconButton = new ButtonBuilder()
                        .setCustomId('view-icon')
                        .setLabel('View Icon')
                        .setStyle(ButtonStyle.Primary)
                    buttons.push(viewIconButton)
                }
                if (thumbnail) {
                    const viewThumbButton = new ButtonBuilder()
                        .setCustomId('view-thumbnail')
                        .setLabel('View Banner')
                        .setStyle(ButtonStyle.Primary)
                    buttons.push(viewThumbButton)
                }

                componentRow = new ActionRowBuilder()
                    .addComponents(buttons)
                
            }

            const responseMessage = await interaction.editReply({ 
                embeds: embeds,
                allowedMentions: { parse: [] },
                components: componentRow ? [componentRow] : []
            })

            if (!componentRow) return

            const collector = responseMessage.createMessageComponentCollector({ 
                time: 300000 
            })

            collector.on('collect', async buttonInteraction => {
                await buttonInteraction.deferReply({ ephemeral: true })

                const imageEmbed = new EmbedBuilder()
                    .setColor(embedColor)

                if (buttonInteraction.customId === 'view-icon') {
                    imageEmbed.setTitle(`${name}'s Server Icon`).setImage(icon)
                } 
                
                else if (buttonInteraction.customId === 'view-thumbnail') {
                    imageEmbed.setTitle(`${name}'s Server Banner`).setImage(thumbnail)
                }

                await buttonInteraction.editReply({
                    embeds: [imageEmbed]
                })
            })

            collector.on('end', async () => {
                try {
                    const disabledButtons = componentRow.components.map(button => 
                        ButtonBuilder.from(button).setDisabled(true)
                    )
                    const disabledRow = new ActionRowBuilder().addComponents(disabledButtons)

                    embeds = []
                    
                    if (icon) mainEmbed.icon = icon
                    if (thumbnail) mainEmbed.thumbnail = thumbnail

                    embeds.push(mainEmbed, membersEmbed, channelsEmbed, datesEmbed)
                    
                    await interaction.editReply({
                        embeds: embeds,
                        allowedMentions: { parse: [] },
                        components: [disabledRow]
                    })
                } catch (e) {}
            })
        }
    },
}