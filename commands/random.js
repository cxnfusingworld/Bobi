const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('gives u a random number')
        .addNumberOption(option =>
            option.setName('minimum')
                .setDescription('minimum value')
        )
        .addNumberOption(option =>
            option.setName('maximum')
                .setDescription('maximum value')
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    async execute(interaction) {
        
        let min = interaction.options.getNumber('minimum') ?? 0
        let max = interaction.options.getNumber('maximum') ?? 100

        if (min > max) {
            const prevMin = min
            min = max
            max = prevMin
        }

        const randomNumber = Math.round(Math.random() * (max - min) + min)
        const final = randomNumber.toString()

        await interaction.reply({
            content: `ur random number between **${min}** and **${max}** is: **${final}**`,
        })
    },
}