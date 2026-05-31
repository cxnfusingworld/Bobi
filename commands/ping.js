const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with the bot latency and websocket ping.'),
    async execute(interaction) {
        
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            fetchReply: true 
        });

        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketPing = interaction.client.ws.ping;

        await interaction.editReply(
            `🏓 Pong!
• **Roundtrip Latency:** \`${roundtripLatency}ms\`
• **Websocket Ping:** \`${websocketPing}ms\``
        );
        
    },
};
