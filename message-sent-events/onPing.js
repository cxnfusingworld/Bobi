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

module.exports = async function (message) {
    if (message.author.bot) return;

    const botId = message.client.user.id;

    if (message.mentions.has(botId)) {
        if (message.reference && message.mentions.repliedUser?.id === botId) {
            // On reply
        } else {
            // On Ping
            var chosenMessage = messages[Math.floor(Math.random()*messages.length)]
            chosenMessage = chosenMessage.replaceAll("<user>", `<@${message.author.id}>`)
            return await message.reply(chosenMessage);
        }
    }

}