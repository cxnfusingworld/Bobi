const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('gives u the latency and ping stuff'),
    async execute(interaction) {
        
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            withResponse: true 
        });

        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketPing = interaction.client.ws.ping;

        await interaction.editReply(
            `🏓 pong!
• **roundtrip latency:** \`${roundtripLatency}ms\`
• **websocket ping:** \`${websocketPing}ms\``
        );
        
    },
};
