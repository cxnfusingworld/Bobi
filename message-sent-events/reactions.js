const { getGuildSettings } = require('../utilities/configHelper.js')
const emojis = require("../assets/emojis.json")

const map = {

    ['treat']: '👀',
    ['mouse']: '👀',
    ['fish']: '👀',

    ['bobi']: '🐱',
    ['domination']: emojis.innocent,
    ['water']: emojis.scared,

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