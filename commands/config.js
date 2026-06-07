const config = require('../config.json')
const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('bot config and stuff')

        // get subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('gives u the current bot config')
        )

        .setContexts([
            InteractionContextType.Guild,
        ]),
    async execute(interaction) {
        
        if (!config.developer_ids.includes(interaction.user.id)) {
            return await interaction.reply({ 
                content: "<:scared:1511147876150018208> hey wait u aren't a dev! u can't see this config", 
                ephemeral: true 
            })
        }

        const sub = interaction.options.getSubcommand()

        // get subcommand
        if (sub === 'get') {
            
            const configEmbed = new EmbedBuilder()
                .setTitle("⚙️ Bobi Global Configuration")
                .setDescription("Automatically loading cluster metrics and environment states.")
                .setColor("Blurple")
                .setTimestamp()

            for (const [key, data] of Object.entries(config)) {
                if (key === 'developer_ids') continue

                let displayValue = data.value

                if (data.displayType === 'percent') {
                    displayValue = `${data.value * 100}%`
                } else if (data.displayType === 'ms') {
                    displayValue = `${data.value / 1000}s`
                } else if (data.valueType === 'boolean') {
                    displayValue = data.value ? '🟢 Enabled' : '🔴 Disabled'
                }

                const cleanName = key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')

                configEmbed.addFields({
                    name: cleanName,
                    value: `\`${displayValue}\``,
                    inline: true
                })
                
            }

            return await interaction.reply({ embeds: [configEmbed], ephemeral: true })
        }
    },
}