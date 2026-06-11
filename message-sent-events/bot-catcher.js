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

    // Message Deletion [moved to index.js]
    // const suspectedBotRoleId = settings.server_suspected_bot_role_id; 
    
    // if (suspectedBotRoleId && suspectedBotRoleId !== 'none') {
    //     if (message.member?.roles.cache.has(suspectedBotRoleId)) {
    //         return await message.delete().catch(() => {});
    //     }
    // }

    // Bot Catcher
    const botCatcherChannelId = settings.server_bot_catcher_channel_id
    if (botCatcherChannelId === 'none' || !botCatcherChannelId) return 
    const botCatcherChannel = await message.guild.channels.fetch(botCatcherChannelId)
    if (!botCatcherChannel || message.channel !== botCatcherChannel) return
    
    const adminRoleId = settings.server_admin_role_id || 'none'
    if (message.member && adminRoleId && adminRoleId !== 'none') {
        const isAdmin = message.member.roles.cache.has(adminRoleId)
        if (isAdmin) return
    }
    
    const botRoleId = settings.server_suspected_bot_role_id
    if (botRoleId && botRoleId !== 'none') {
        const botRole = await message.guild.roles.fetch(botRoleId).catch(() => null)        
        if (message.member && botRole) {
            try {
                await message.member.roles.add(botRole)
            } catch (err) {
                console.error(`[Bot Catcher] Failed to add role to ${message.author.tag}:`, err)
            }
        }
    }

    try {
        
        const logChannelId = settings.server_log_channel_id || botCatcherChannelId
        const logChannel = await message.guild.channels.fetch(logChannelId)
        
        if (logChannel) {

            let content = message.content || "*no text content*"
            if (content.length > maxMessageSize) {
                content = content.substring(0, maxMessageSize) + '...'
            }

            let additionalMessage = `<@&${adminRoleId}>`
            if (additionalMessage.includes('none')) additionalMessage = '-# set an admin role to add pings' 

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
                .addText(`-# Previous 10 messages in all channels deleted.`)
                .addText(`-# ${message.author} has been given bot role [if possible].`)
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

            logChannel.send({ content: additionalMessage })
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
                    .addText(`-# Previous 10 messages in all channels deleted.`)
                    .addText(`-# ${message.author} has been given bot role [if possible].`)
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
    
    try {

        await message.delete().catch(() => {})

        const targetUser = message.author
        const textChannels = message.guild.channels.cache.filter(ch => ch.isTextBased())

        for (const [id, channel] of textChannels) {
            try {
                const fetchedMessages = await channel.messages.fetch({ limit: 10 })
                const spamMessages = fetchedMessages.filter(msg => msg.author.id === targetUser.id)
                
                if (spamMessages.size > 0) {
                    await channel.bulkDelete(spamMessages, true).catch(() => {})
                }
            } catch (err) {
                continue
            }
        }

    } catch (deleteError) {
        console.error("[Bot Catcher]: Failed to delete messages:", deleteError)        
    }

}