const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    InteractionContextType, 
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js')

const mainColor = '#7289da'
const membersColor = '#5067b8'
const channelsColor = '#34478e'
const datesColor = '#203069'
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
            const id = guild.id 
            const owner = guild.ownerId

            const botCount = guild.members.cache.filter(member => member.user.bot).size

            const memberCount = guild.memberCount - botCount
            const allMemberCount = guild.memberCount

            const icon = guild.iconURL({ dynamic: true, size: 256 })
            const banner = guild.bannerURL({ dynamic: true })
            
            const creationDate = Math.floor(guild.createdAt/1000)
            
            const channels = await guild.channels.fetch()
            const totalChannels = channels.size
            const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size
            const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size
            const forumChannels = channels.filter(c => c.type === ChannelType.GuildForum).size

            // Embeds

            let embeds = []
            const mainEmbed = new EmbedBuilder()
                .setColor(mainColor)
                .setTitle(name)
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Server ID', value: id, inline: true },
                    { name: 'Owner', value: `<@${owner}>`, inline: true },
                ])
            const membersEmbed = new EmbedBuilder()
                .setColor(membersColor)
                .setTitle('Members')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Total Member Count', value: `${allMemberCount}`, inline: true },
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                    { name: 'Bot Count', value: `${botCount}`, inline: true },
                ])
            const channelsEmbed = new EmbedBuilder()
                .setColor(channelsColor)
                .setTitle('Channels')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'All Channels', value: `${totalChannels}`, inline: true },
                    { name: 'Text Channels', value: `${textChannels}`, inline: true },
                    { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                    { name: 'Forum Channels', value: `${forumChannels}`, inline: true },
                ])
            const datesEmbed = new EmbedBuilder()
                .setColor(datesColor)
                .setTitle('Dates')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Created', value: `<t:${creationDate}:f> (<t:${creationDate}:R>)`, inline: true },
                ])

            embeds.push(mainEmbed, membersEmbed, channelsEmbed, datesEmbed)

            // Buttons

            let componentRow = null

            if (icon || banner) {

                let buttons = []

                if (icon) {
                    const viewIconButton = new ButtonBuilder()
                        .setCustomId('view-icon')
                        .setLabel('View Icon')
                        .setStyle(ButtonStyle.Primary)
                    buttons.push(viewIconButton)
                }
                if (banner) {
                    const viewThumbButton = new ButtonBuilder()
                        .setCustomId('view-banner')
                        .setLabel('View Banner')
                        .setStyle(ButtonStyle.Primary)
                    buttons.push(viewThumbButton)
                }

                componentRow = new ActionRowBuilder().addComponents(buttons)
                
            }

            const responseMessage = await interaction.editReply({ 
                embeds: embeds,
                allowedMentions: { parse: [] },
                components: componentRow ? [componentRow] : []
            })

            if (!componentRow) return

            // Button Interactions

            const collector = responseMessage.createMessageComponentCollector({ 
                time: 300000 
            })

            collector.on('collect', async buttonInteraction => {
                // await buttonInteraction.deferReply({ ephemeral: true })

                console.log("brooo i pressed it")

                const imageEmbed = new EmbedBuilder()
                    .setColor(embedColor)

                if (buttonInteraction.customId === 'view-icon') {
                    imageEmbed.setTitle(`${name} | Server Icon`).setImage(icon)
                } else if (buttonInteraction.customId === 'view-banner') {
                    imageEmbed.setTitle(`${name} | Server Banner`).setImage(banner)
                }

                console.log("replying rn")

                await buttonInteraction.reply({
                    embeds: [imageEmbed],
                    ephemeral: true,
                })
            })

            collector.on('end', async () => {
                try {
                    const disabledButtons = componentRow.components.map(button => 
                        ButtonBuilder.from(button).setDisabled(true).setStyle(ButtonStyle.Secondary)
                    )
                    const disabledRow = new ActionRowBuilder().addComponents(disabledButtons)
                    
                    if (icon) mainEmbed.setThumbnail(icon)
                    if (banner) mainEmbed.setImage(banner)
                    
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