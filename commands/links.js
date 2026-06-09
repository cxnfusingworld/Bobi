const { SlashCommandBuilder, InteractionContextType } = require('discord.js')
const emojis = require('../assets/emojis.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription('info and stuff yeah')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ]),
    async execute(interaction) {
        await interaction.reply({
            content: `# ═══════ ${emojis.youtube} Youtube ═══════
## ${emojis.youtube}  |  [Main YT Channel](<https://www.youtube.com/@cxnfusion.?sub_confirmation=1>)
## 2️⃣ ${emojis.youtube}   |  [Secondary YT Channel](<https://youtube.com/@morecxnfusion?sub_confirmation=1>)
# ═══════ ${emojis.instagram} Socials ═══════
## ${emojis.instagram}  |  [Instagram](<https://www.instagram.com/cxnfusingworld>)
# ═══════ ${emojis.discord} Discord ═══════
## ${emojis.discord}  |  [A Cxnfusing World](<https://discord.gg/Mq2RYptX6B>)
# ═══════ ${emojis.roblox} Roblox ═══════
## ${emojis.roblox}  |  [Roblox Account](<https://www.roblox.com/users/2565560791/profile>)
## ${emojis.roblox}👪  |  [Roblox Group](<https://www.roblox.com/communities/71884719/Cxnfusing-Community#!/about>)
# ═══════ ${emojis.heart} Support ═══════
## 💵  |  [Donate](<https://www.roblox.com/games/138236517199900/Donations>)
# ═════════════════════`,
            ephemeral: true,
        })
        
    },
} 