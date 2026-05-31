const { SlashCommandBuilder } = require('discord.js');

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

        var min = interaction.options.getString('minimum') || 0
        var max = interaction.options.getString('maximum') || 100

        if (min > max)
            var prevMin = min
            min = max
            max = prevMin

        const final = (Math.random()*(max-min)+min).toString()

        await interaction.reply({
            content: final,
            // ephemeral: true,
        })

    },
};