const { Colors, MessageFlags } = require('discord.js')

const { getGuildSettings } = require('../utilities/configHelper.js')
const ComponentBuilder = require('../utilities/v2Helper')
const emojis = require("../assets/emojis.json")

const maxMessageSize = 500

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
                    content = content.substring(0, maxMessageSize) + '...'
                }

                const imageUrls = []
                const fileLinks = []

                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        const isImage = attachment.contentType?.startsWith('image/') || 
                                        /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.url)
                        
                        if (isImage) {
                            imageUrls.push(attachment.url)
                        } else {
                            fileLinks.push(`📄 [${attachment.name}](${attachment.url})`)
                        }
                    })
                }

                let layout = new ComponentBuilder()
                    .setColor(Colors.Red)
                    .addText(`# ⚠️  Possible Bot  ⚠️`)
                    .addDivider()
                    .addText(`${message.author} chatted in ${botCatcherChannel}`)
                    .addDivider()
                    .addText("Message:")
                    .addText(content || "_No text content_")

                if (imageUrls.length > 0) {
                    layout.addDivider()
                    layout.addText("🖼️ Attached Images:")
                    layout.addImages(imageUrls)
                }

                if (fileLinks.length > 0) {
                    layout.addDivider()
                    layout.addText("📎 Attached Files:")
                    layout.addText(fileLinks.join('\n'))
                }

                const finalPayload = layout
                    .setNoPing()
                    .build()
                        
                await logChannel.send(finalPayload)
            }
        }
    } catch (auditError) {
        console.error("[Bot Catcher]: Failed to send server audit log:", auditError)
    }

    setTimeout(() => {
        message.delete()        
    }, 10*1000)
}