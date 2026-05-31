const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Gives you a random number!')
        .addNumberOption(option =>
            option.setName('minimum')
                .setDescription('The minimum value')
        )
        .addNumberOption(option =>
            option.setName('maximum')
                .setDescription('The maximum value')
        ),
    async execute(interaction) {
        
        let min = interaction.options.getNumber('minimum') ?? 0
        let max = interaction.options.getNumber('maximum') ?? 100

        if (min > max) {
            const prevMin = min
            min = max
            max = prevMin
        }

        const randomNumber = Math.round(Math.random() * (max - min) + min)

        await interaction.reply({
            content: `Your random number between **${min}** and **${max}** is: **${final}**`,
        })
    },
}