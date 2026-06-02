const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, ChannelType } = require('discord.js')

const widthStretcher = "**\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003**";

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
                });
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
                .setColor('#7289da')
                .setTitle(name)
                .setDescription(`${desc}\n${widthStretcher}`)
            const membersEmbed = new EmbedBuilder()
                .setColor('#7289da')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Owner', value: `<@${owner}>`, inline: true },
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                ])
            const channelsEmbed = new EmbedBuilder()
                .setColor('#7289da')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'All Channels', value: `${totalChannels}`, inline: true },
                    { name: 'Text Channels', value: `${textChannels}`, inline: true },
                    { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                    { name: 'Forum Channels', value: `${forumChannels}`, inline: true },
                ])
            const datesEmbed = new EmbedBuilder()
                .setColor('#7289da')
                .setDescription(widthStretcher)
                .addFields([
                    { name: 'Created', value: `<t:${creationDate}:f> (<t:${creationDate}:R>)`, inline: true },
                ])

            embeds.push(mainEmbed, membersEmbed, channelsEmbed, datesEmbed)

            if (icon) mainEmbed.setThumbnail(icon)
            if (thumbnail) mainEmbed.setImage(thumbnail)

            await interaction.editReply({ 
                embeds: embeds,
                allowedMentions: { parse: [] } 
            })
        }
    },
}