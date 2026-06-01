const map = {
    ["confusion"]: "cxnfusion",
    ["confusing"]: "cxnfusing",
    ["confused"]: "cxnfused",
    ["confuse"]: "cxnfuse",
    ["kleo"]: "ǝuoɓoloǝʞılʞoǝlʞǝoʞılʞǝoʞılʞ",
}

module.exports = async function (message) {

    for (const [key, value] of Object.entries(map)) {
        const messageContent = message.content.toLowerCase()
        if (messageContent.includes(key)) {
            await message.reply(value+"*")
            break
        }
    }

}