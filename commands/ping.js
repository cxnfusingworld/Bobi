// This is exactly like a Luau ModuleScript returning a table
module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    async execute(message) {
        await message.reply('Pong! 🏓');
    }
};