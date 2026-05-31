async function onExecution(message) {
    await message.reply('Pong! 🏓')
}

module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    execute = onExecution,
};