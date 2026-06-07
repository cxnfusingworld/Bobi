const config = require('../config.json')

const map = {

    ['treat']: '👀',
    ['mouse']: '👀',
    ['fish']: '👀',

    ['bobi']: '🐱',
    ['domination']: '<:innocent:1511136501927247993>',
    ['water']: '<:scared:1511147876150018208>',

}

module.exports = async function (message) {
    if (!config.message_reactions_enabled) return
    
    for (const [key, value] of Object.entries(map)) {
        const messageContent = message.content.toLowerCase()
        if (messageContent.includes(key)) {
            message.react(value)
            break
        }
    }

}