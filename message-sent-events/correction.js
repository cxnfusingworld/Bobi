const map = {
    ["confusion"]: "cxnfusion",
    ["confusing"]: "cxnfusing",
    ["confused"]: "cxnfused",
    ["confuse"]: "cxnfuse",
}

module.exports = async function (message) {

    for (const [key, value] of Object.entries(map)) {
        console.log(key,value);
        if (message.content.includes(key))
            await message.reply(value+"*")
            break
    }

}