const { SlashCommandBuilder, EmbedBuilder, InteractionContextType, ChannelType } = require('discord.js')

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

            const icon = guild.iconURL({ dynamic: true, size: 256 })
            const memberCount = guild.memberCount
            
            const creationDate = guild.createdAt
            
            const channels = await guild.channels.fetch()
            const textChannels = channels.filter(c => ChannelType.GuildText).size
            const voiceChannels = channels.filter(c => ChannelType.GuildVoice).size

            const newEmbed = new EmbedBuilder()
                .setColor('#7289da')
                .setTitle(name)
                .setDescription(desc)
                .addFields([
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                    { name: 'Text Channels', value: `${textChannels}`, inline: true },
                    { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(creationDate / 1000)}:R>`, inline: true },
                ])
                .setTimestamp()

            if (icon) {
                newEmbed.setThumbnail(icon)
            }

            await interaction.editReply({ embeds: [newEmbed] })
        }
    },
}