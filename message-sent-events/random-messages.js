const { getGuildSettings } = require('../utilities/configHelper.js')

const randomMessages = [
    
    { text: "do u guys have snacks?", weight: 100 },
    { text: "😛", weight: 35 },
    { text: "meow", weight: 80 },
    { text: "yo did u see any mice btw?", weight: 60 },

    { text: "shush", weight: 20, deleteAfter: true },
    { text: "they'll never believe you.", weight: 10, deleteAfter: true },
    { text: "you're next.", weight: 5, deleteAfter: true },
    { text: ".-.. -- .- --- / .. / .-- .- ... - . -.. / ..- .-. / - .. -- .", weight: 4, deleteAfter: true },

]

const activeCooldowns = new Set()

function getWeightedAnswer() {
    const totalWeight = randomMessages.reduce((sum, answer) => sum + answer.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const answer of randomMessages) {
        random -= answer.weight
        if (random <= 0) {
            return answer
        }
    }
    
    return randomMessages[0]
}

module.exports = async function (message) {
    if (!message.guild) return
    if (message.author.bot) return
    if (activeCooldowns.has(message.author.id)) return
    
    const settings = await getGuildSettings(message.guild.id)
    if (!settings.random_message_enabled) return
    
    const rand = Math.random()
    if (rand<settings.random_message_chance) {

        activeCooldowns.add(message.author.id)

        const chosen = getWeightedAnswer()
        const text = chosen.text
        const deleteAfter = chosen.deleteAfter

        const secretMessage = await message.channel.send(text)

        if (deleteAfter) {
            setTimeout(async () => {
                await secretMessage.delete().catch(() => {})
            }, 500)
        }

        setTimeout(() => {
            activeCooldowns.delete(message.author.id)
        }, settings.random_message_cooldown)

    }

}