const { getGuildSettings } = require('../utilities/configHelper.js')

const messages = [
    "what nowww??",
    "meow",
    "que? yo no hablo ingles",
    "im tryna nap vro what do u want",
    ">:(",
    "no ping plss :((",
    "shush",
    "<user> <user> <user> <user>\nyeah how do *YOU* like it??"
]

const onSmiteMessages = [
    "ow",
    "*dies*",
    "bro <fuck> you",
    "rude :(",
    "<:why:1513024914314104872>",
]

function getMessage(from, message, settings) {
    let chosenMessage = from[Math.floor(Math.random() * from.length)]

    chosenMessage = chosenMessage.replaceAll("<user>", `<@${message.author.id}>`)

    chosenMessage = chosenMessage.replaceAll("<fuck>", settings.foul_language ? 'fuck' : 'flip')
    chosenMessage = chosenMessage.replaceAll("<shit>", settings.foul_language ? 'shit' : 'stuff')

    return chosenMessage
}

async function checkSmite(message, settings) {
    if (message.content.includes('https://tenor.com/view/worldbox-smited-lightning-gif-17816464421779196148')) {
        let chosenMessage = getMessage(onSmiteMessages, message, settings)
        await message.reply(chosenMessage)
        return true
    }
    return false
}

module.exports = async function (message) {
    if (message.author.bot) return
    if (!message.guild) return

    const settings = await getGuildSettings(message.guild.id)
    const botId = message.client.user.id

    if (message.mentions.has(botId)) {
        if (message.reference && message.mentions.repliedUser?.id === botId) {
            if (!settings.on_reply_actions) return
            // On reply
            await checkSmite(message, settings)
        } else {
            if (!settings.on_ping_actions) return
            // On ping
            if (await checkSmite(message, settings)) return
            
            let chosenMessage = getMessage(messages, message, settings)
            return await message.reply(chosenMessage)
        }
    }
}