const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('gives u the latency and ping stuff')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ]),
    async execute(interaction) {
        
        const { resource } = await interaction.reply({ 
            content: 'Pinging...', 
            withResponse: true,
            ephemeral: true,
        });

        const roundtripLatency = resource.message.createdTimestamp - interaction.createdTimestamp;
        const websocketPing = interaction.client.ws.ping;

        await interaction.editReply(
            `🏓 pong!
• **roundtrip latency:** \`${roundtripLatency}ms\`
• **websocket ping:** \`${websocketPing}ms\``
        );
        
    },
};
