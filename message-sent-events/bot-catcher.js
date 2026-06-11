const { Colors, MessageFlags } = require('discord.js')

const { getGuildSettings } = require('../utilities/configHelper.js')
const ComponentBuilder = require('../utilities/v2Helper')
const emojis = require("../assets/emojis.json")

const maxMessageSize = 150

module.exports = async function (message) {
    if (message.author.bot) return
    if (!message.guild) return
    
    const settings = await getGuildSettings(message.guild.id)
    
    const botCatcherChannelId = settings.server_bot_catcher_channel_id
    if (botCatcherChannelId === 'none' || botCatcherChannelId === null) return 
    const botCatcherChannel = await message.guild.channels.fetch(botCatcherChannelId)
    if (botCatcherChannel === null || message.channel !== botCatcherChannel) return
    
    try {
        const logChannelId = settings.server_log_channel_id || botCatcherChannelId
        if (logChannelId && logChannelId !== 'none') {
            const logChannel = await message.guild.channels.fetch(logChannelId)
            if (logChannel) {

                let content = message.content
                if (content.length > maxMessageSize) {
                    content = content.substring(0, maxMessageSize)+'...'
                }

                let layout = new ComponentBuilder()
                    .setColor(Colors.Red)
                    .addText(`# ⚠️  Possible Bot  ⚠️`)
                    .addDivider()
                    .addText(`${message.author} chatted in ${botCatcherChannel}`)
                    .addDivider()
                    .addText("Message:")
                    .addText(content)
                    .setNoPing()
                    .build()
                        
                await logChannel.send(layout)
            }
        }
    } catch (auditError) {
        console.error("[Bot Catcher]: Failed to send server audit log:", auditError)
    }

    message.delete()

}