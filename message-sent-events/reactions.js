const { getGuildSettings } = require('../utilities/configHelper.js')

const map = {

    ['treat']: '👀',
    ['mouse']: '👀',
    ['fish']: '👀',

    ['bobi']: '🐱',
    ['domination']: '<:innocent:1511136501927247993>',
    ['water']: '<:scared:1511147876150018208>',

}

module.exports = async function (message) {
    if (message.author.bot) return
    if (!message.guild) return

    const settings = await getGuildSettings(message.guild.id)
    if (!settings.message_reactions_enabled) return
    
    for (const [key, value] of Object.entries(map)) {
        const messageContent = message.content.toLowerCase()
        if (messageContent.includes(key)) {
            message.react(value)
            break
        }
    }

}