const map = {
    ['treat']: '👀',
    ['bobi']: '🐱',
}

module.exports = async function (message) {
    
    for (const [key, value] of Object.entries(map)) {
        const messageContent = message.content.toLowerCase()
        if (messageContent.includes(key)) {
            message.react(value)
            break
        }
    }

}