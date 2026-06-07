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
    "bro fuck you",
    "rude :(",
    "<:why:1513024914314104872>",
]

function getMessage(from, message) {
    let chosenMessage = from[Math.floor(Math.random() * from.length)]
    chosenMessage = chosenMessage.replaceAll("<user>", `<@${message.author.id}>`)
    return chosenMessage
}

async function checkSmite(message) {
    if (message.content.includes('https://tenor.com/view/worldbox-smited-lightning-gif-17816464421779196148')) {
        let chosenMessage = getMessage(onSmiteMessages, message)
        await message.reply(chosenMessage)
        return true
    }
    return false
}

module.exports = async function (message) {
    if (message.author.bot) return

    const botId = message.client.user.id

    if (message.mentions.has(botId)) {
        if (message.reference && message.mentions.repliedUser?.id === botId) {
            // On reply
            await checkSmite(message)
        } else {
            // On ping
            if (await checkSmite(message)) return
            
            let chosenMessage = getMessage(messages, message)
            return await message.reply(chosenMessage)
        }
    }
}