const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fetch = require('node-fetch')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox-user')
        .setDescription('Fetches information about a Roblox user!')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Roblox username to lookup')
                .setRequired(true)
        ),

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
                return await interaction.editReply(`Could not find a Roblox user named **${username}** ❌`)
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

            // 4. Build the beautiful Embed Box!
            const robloxEmbed = new EmbedBuilder()
                .setColor('rgb(31, 72, 255)') // Roblox Red!
                .setTitle(`${displayName} (@${realName})`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setDescription(detailData.description || '*No description set.*')
                .setThumbnail(avatarUrl) // Puts the avatar in the top right corner
                .addFields(
                    { name: '🆔 User ID', value: `\`${userId}\``, inline: true },
                    { name: '📆 Account Created', value: createdDate, inline: true }
                )
                // .setTimestamp()

            // Send the embed back to the channel
            await interaction.editReply({ embeds: [robloxEmbed] })

        } catch (error) {
            console.error('Roblox API Error:', error)
            await interaction.editReply('roblox is being annoying mb 😭')
        }
    }
}