const { Colors, MessageFlags, AttachmentBuilder } = require('discord.js')
const axios = require('axios')

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
        const logChannel = await message.guild.channels.fetch(logChannelId)
        
        if (logChannel) {

            let content = message.content || "*no text content*"
            if (content.length > maxMessageSize) {
                content = content.substring(0, maxMessageSize) + '...'
            }

            const imageAttachments = []
        const fileAttachments = []

        if (message.attachments.size > 0) {
            for (const [id, attachment] of message.attachments) {
                const isImage = attachment.contentType?.startsWith('image/') || 
                                /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.url)
                try {
                    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' })
                    const buffer = Buffer.from(response.data, 'binary')
                    const freshFile = new AttachmentBuilder(buffer, { name: attachment.name })

                    if (isImage) {
                        imageAttachments.push(freshFile)
                    } else {
                        fileAttachments.push(freshFile)
                    }
                } catch (err) {
                    console.error(`[Bot Catcher] Asset save failed: ${attachment.name}`, err)
                }
            }
        }

        let layoutBuilder = new ComponentBuilder()
            .setColor(Colors.Red)
            .addText(`# ⚠️  Possible Bot  ⚠️`)
            .addDivider()
            .addText(`${message.author} chatted in ${botCatcherChannel}`)
            .addDivider()
            .addText("Message:")
            .addText(content)

        if (imageAttachments.length > 0) {
            layoutBuilder
                .addDivider()
                .addText("🖼️ Attached Images:")
                .addImages(imageAttachments)
        }

        if (fileAttachments.length > 0) {
            layoutBuilder
                .addDivider()
                .addText("📎 Attached Files:")
                .addText("⏳ *Saving files...*")
        }

        const payload = layoutBuilder.setNoPing().build()
        
        await message.delete().catch(() => {})

        const sentLog = await logChannel.send({
            ...payload,
            files: [...payload.files, ...fileAttachments] 
        })

        if (fileAttachments.length > 0) {
            const totalAttachments = Array.from(sentLog.attachments.values())

            const freshLinks = totalAttachments
                .filter(att => !/\.(jpg|jpeg|png|gif|webp)$/i.test(att.name))
                .map(att => `📄 [${att.name}](${att.url})`)
                .join('\n')

            let updatedBuilder = new ComponentBuilder()
                .setColor(Colors.Red)
                .addText(`# ⚠️  Possible Bot  ⚠️`)
                .addDivider()
                .addText(`${message.author} chatted in ${botCatcherChannel}`)
                .addDivider()
                .addText("Message:")
                .addText(content)

            if (imageAttachments.length > 0) {
                updatedBuilder
                    .addDivider()
                    .addText("🖼️ Attached Images:")
                    .addImages(imageAttachments)
            }

            updatedBuilder
                .addDivider()
                .addText("📎 Attached Files:")
                .addText(freshLinks || "⚠️ *Failed to generate secure links*")

            const finalPayload = updatedBuilder.setNoPing().build()
            await sentLog.edit({
                components: finalPayload.components,
                allowedMentions: finalPayload.allowedMentions
            })
        }
    }
    } catch (auditError) {
        console.error("[Bot Catcher]: Failed to send server audit log:", auditError)
    }
}