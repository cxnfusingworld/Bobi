const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType } = require('discord.js')

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
            const desc = guild.description

            const icon = guild.iconURL
            const memberCount = guild.memberCount
            
            const creationDate = guild.createdAt
            
            const textChannels = guild.channels.cache.filter(c => c.type === 0).size
            const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size

            const newEmbed = new EmbedBuilder()
                .setColor('#7289da')
                .setAuthor({ 
                    name: `Server Info`, 
                    iconURL: icon,
                })
                .setTitle(`${name}`)
                .setDescription(desc)
                .addFields([
                    { name: 'Member Count', value: `${memberCount}`, inline: true },
                    { name: 'Text Channels', value: `${textChannels}`, inline: true },
                    { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(creationDate / 1000)}:R>`, inline: true },
                ])
                .setTimestamp()

            await interaction.editReply({ embeds: [newEmbed] })
        }
    },
}