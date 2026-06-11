const { getGuildSettings } = require('../utilities/configHelper.js')
const emojis = require("../assets/emojis.json")
const sendChannelLog = require('../utilities/channelLogger.js')

module.exports = async function (message) {
    if (message.author.bot) return
    if (!message.guild) return
    
    const settings = await getGuildSettings(message.guild.id)
    
    const botCatcherChannelId = settings.server_bot_catcher_channel_id
    const botCatcherChannel = botCatcherChannelId ? await message.guild.channels.fetch(botCatcherChannelId) : null
    if (botCatcherChannel === null || message.channel !== botCatcherChannel) return
    
    try {
        const logChannelId = settings.server_log_channel_id || botCatcherChannelId
        if (logChannelId && logChannelId !== 'none') {
            const logChannel = await message.guild.channels.fetch(logChannelId)
            if (logChannel) {
                let content = message.content
                if (content.length > 100) {
                    content = content.substring(0, 100)+'...'
                }
                await sendChannelLog(logChannel, {
                    title: `⚠️ Possible Bot ⚠️`,
                    description: `${message.author} chatted in ${botCatcherChannel}`,
                    color: 'Red',
                    fields: [
                        { name: "User", value: `<@${message.author.id}>`, inline: true },
                        { name: "Message", value: content, inline: true },
                    ]
                })
            }
        }
    } catch (auditError) {
        console.error("[Bot Catcher]: Failed to send server audit log:", auditError)
    }

}