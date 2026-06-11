const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js')

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
            content: 'calculating ball velocity...', 
            withResponse: true,
            flags: MessageFlags.Ephemeral,
        })

        const roundtripLatency = Math.max(resource.message.createdTimestamp - interaction.createdTimestamp, 0)
        
        const wsPing = interaction.client.ws.ping
        const websocketPingDisplay = wsPing < 0 ? 'Calculating...' : `${wsPing}ms`

        await interaction.editReply(
            `🏓 pong!
-# why are you playing ping pong with a cat..?
\`\`\`ansi
[32mroundtrip latency:[39m ${roundtripLatency}ms
   [32mwebsocket ping:[39m ${websocketPingDisplay}
\`\`\``
        )
        
    },
}