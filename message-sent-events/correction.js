const { getGuildSettings } = require('../utilities/configHelper.js')

const map = {

    ["confusion"]: "cxnfusion",
    ["confusing"]: "cxnfusing",
    ["confused"]: "cxnfused",
    ["confuse"]: "cxnfuse",

    ["kleo"]: "ǝuoɓoloǝʞılʞoǝlʞǝoʞılʞǝoʞılʞ",
    ["khleo"]: "ǝuoɓoloǝʞılʞoǝlʞǝoʞılʞǝoʞılʞ",
    
}

module.exports = async function (message) {
    if (message.author.bot) return
    if (!message.guild) return
    
    const settings = await getGuildSettings(message.guild.id)
    if (!settings.corrections_enabled) return

    for (const [key, value] of Object.entries(map)) {
        const messageContent = message.content.toLowerCase()
        if (messageContent.includes(key)) {
            await message.reply(value+"*")
            break
        }
    }

}