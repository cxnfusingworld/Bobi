const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js')
const fetch = require('node-fetch')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox-user')
        .setDescription('finds sum info about someone')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('the username of the person')
                .setRequired(true)
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction) {
        const username = interaction.options.getString('username')
        
        await interaction.deferReply()

        try {
            const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
            })
            const userData = await userResponse.json()

            if (!userData.data || userData.data.length === 0) {
                return await interaction.editReply(`${username} is NOT a user bro`)
            }

            const player = userData.data[0]
            const userId = player.id
            const displayName = player.displayName
            const realName = player.name

            const detailResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`)
            const detailData = await detailResponse.json()
            
            const createdDate = new Date(detailData.created).toLocaleDateString('en-US')

            const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`)
            const thumbData = await thumbResponse.json()
            const avatarUrl = thumbData.data?.[0]?.imageUrl || ''

            const robloxEmbed = new EmbedBuilder()
                .setColor('#1f48ff')
                .setTitle(`${displayName} (@${realName})`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(detailData.description || '*very boring person who has no description 🤔*')
                .setThumbnail(avatarUrl)
                .addFields(
                    { name: 'User ID', value: `\`${userId}\``, inline: true },
                    { name: 'Account Created', value: '\`createdDate\`', inline: true }
                )
                // .setTimestamp()

            await interaction.editReply({ embeds: [robloxEmbed] })

        } catch (error) {
            console.error('Roblox API Error:', error)
            await interaction.editReply('roblox is being annoying mb 😭')
        }
    }
}