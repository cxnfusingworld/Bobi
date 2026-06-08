const { EmbedBuilder } = require('discord.js')

/**
 * cool log thingy!!
 * @param {TextChannel} channel - The Discord channel object to send the log to
 * @param {Object} logData - The layout data for the log
 * @param {string} logData.title - The title of the embed
 * @param {string} logData.description - The main description text
 * @param {string} [logData.color] - Hex code or name color (Defaults to Orange)
 * @param {Array<Object>} [logData.fields] - Optional array of fields [{ name: '', value: '', inline: true }]
 */
module.exports = async function (channel, logData) {
    if (!channel || !channel.isTextBased()) return false

    try {
        const embed = new EmbedBuilder()
            .setTitle(logData.title)
            .setDescription(logData.description)
            .setColor(logData.color || "Orange")
            .setTimestamp()

        if (logData.fields && Array.isArray(logData.fields)) {
            embed.addFields(logData.fields)
        }

        await channel.send({ embeds: [embed] })
        return true
    } catch (error) {
        console.error(`[Logger Utility Error] Failed to send log: ${error.message}`)
        return false
    }
}