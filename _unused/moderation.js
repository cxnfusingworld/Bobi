const { SlashCommandBuilder, InteractionContextType } = require('discord.js')
const { getGuildSettings } = require('../utilities/configHelper.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('moderation settings')
        .addSubcommand(subcommand => 
            subcommand.setName('bot-catcher')
            .setDescription('set a channel for catching bots')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('the channel to set (leave blank to remove)')
            )
        )
        .setContexts([
            InteractionContextType.Guild,
        ]),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand()
        const settings = await getGuildSettings(message.guild.id)

        if (sub === 'bot-catcher') {

            const channel = interaction.options.getChannel('channel')

        }
        
    },
}