const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js')

/// EXPERIENCE HELPERS \\\

async function getUniverseIdFromPlace(placeId) {
    try {
        const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`)
        if (!response.ok) return null
        
        const data = await response.json()
        return data.universeId // Gives us the clean back-end ID we need!
    } catch (error) {
        console.warn("Roblox API [Place -> Universe] Failed:", error)
        return null
    }
}

async function getGameDetails(universeId) {
    try {
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
        const data = await response.json()
        if (!data.data || data.data.length === 0) return null
        return data.data[0] 
    } catch (error) {
        console.warn("Roblox API [Details] Failed:", error)
        return null
    }
}

async function getGameIcon(universeId) {
    try {
        const response = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
        const data = await response.json()
        if (!data.data || data.data.length === 0) return null
        return data.data[0].imageUrl
    } catch (error) {
        console.warn("Roblox API [Icon] Failed:", error)
        return null
    }
}

async function getGameThumbnail(universeId) {
    try {
        const response = await fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`)
        const data = await response.json()
        if (!data.data || data.data.length === 0 || !data.data[0].thumbnails[0]) return null
        return data.data[0].thumbnails[0].imageUrl
    } catch (error) {
        console.warn("Roblox API [Thumbnail] Failed:", error)
        return null
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('roblox lookup utility tools')
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ])

        // user
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('finds sum info about someone')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('the username of the person')
                        .setRequired(true)
                )
        )

        // experience
        .addSubcommand(subcommand =>
            subcommand
                .setName('experience')
                .setDescription('gets info about a roblox game')
                .addStringOption(option =>
                    option.setName('place-id')
                        .setDescription('the place id of the roblox game')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply()
        
        const sub = interaction.options.getSubcommand()

        // -------------------------
        // USER SUBCOMMAND
        // -------------------------
        if (sub === 'user') {
            const username = interaction.options.getString('username')
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

                const userEmbed = new EmbedBuilder()
                    .setColor('#1f48ff')
                    .setTitle(`${displayName} (@${realName})`)
                    .setURL(`https://www.roblox.com/users/${userId}/profile`)
                    .setDescription(detailData.description || '*very boring person who has no description 🤔*')
                    .setThumbnail(avatarUrl)
                    .addFields(
                        { name: 'User ID', value: `${userId}`, inline: true },
                        { name: 'Account Created', value: createdDate, inline: true }
                    )

                await interaction.editReply({ embeds: [userEmbed] })
            } catch (error) {
                console.error('Roblox User API Error:', error)
                await interaction.editReply('roblox is being annoying mb 😭')
            }
        }

        // -------------------------------
        // EXPERIENCE SUBCOMMAND
        // -------------------------------
        if (sub === 'experience') {

            const placeId = interaction.options.getString('place-id')
            const universeId = await getUniverseIdFromPlace(placeId)

            const [details, iconUrl, thumbnailUrl] = await Promise.all([
                getGameDetails(universeId),
                getGameIcon(universeId),
                getGameThumbnail(universeId)
            ])

            if (!details) {
                return await interaction.editReply({
                    content: "yeah theres no game w that id vro 🤔🤔"
                })
            }

            const expEmbed = new EmbedBuilder()
                .setColor('#1f48ff') 
                .setTitle(details.name)
                .setURL(`https://www.roblox.com/games/${details.rootPlaceId}`)
                .setDescription(details.description || "*very boring game w no description*")
                .addFields(
                    { name: 'Creator', value: details.creator.name, inline: true },
                    { name: 'Active Players', value: details.playing.toLocaleString(), inline: true },
                    { name: 'Visits', value: details.visits.toLocaleString(), inline: true }
                )

            if (iconUrl) expEmbed.setThumbnail(iconUrl)
            if (thumbnailUrl) expEmbed.setImage(thumbnailUrl)

            await interaction.editReply({ embeds: [expEmbed] })
        }
    }
}