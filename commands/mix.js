const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mix')
        .setDescription('mix two colors together')
        .addStringOption(option =>
            option.setName('first-color')
                .setDescription('first color to mix')
                .setRequired(true)
                .addChoices(
                    { name: 'Red 🔴', value: 'red' },
                    { name: 'Blue 🔵', value: 'blue' },
                    { name: 'Yellow 🟡', value: 'yellow' },
                    { name: 'White ⚪', value: 'white' },
                    { name: 'Black ⚫', value: 'black' }
                ))
        .addStringOption(option =>
            option.setName('second-color')
                .setDescription('second color to mix')
                .setRequired(true)
                .addChoices(
                    { name: 'Red 🔴', value: 'red' },
                    { name: 'Blue 🔵', value: 'blue' },
                    { name: 'Yellow 🟡', value: 'yellow' },
                    { name: 'White ⚪', value: 'white' },
                    { name: 'Black ⚫', value: 'black' }
                )),

    async execute(interaction) {
        const first = interaction.options.getString('first-color');
        const second = interaction.options.getString('second-color');

        if (first === second) {
            const emojiMap = { red: '🔴', blue: '🔵', yellow: '🟡', white: '⚪', black: '⚫' };
            return await interaction.reply({
                content: `mixing ${emojiMap[first]} ${first} and ${emojiMap[second]} ${second} is just more ${first} lol`,
                // ephemeral: true
            });
        }

        const combination = [first, second].sort().join('-');

        const colorRecipes = {
            'blue-red': { name: 'purple' },
            'red-yellow': { name: 'orange' },
            'blue-yellow': { name: 'green' },
            'red-white': { name: 'pink' },
            'blue-white': { name: 'light blue' },
            'white-yellow': { name: 'light yellow' },
            'black-white': { name: 'grey' },
            'black-red': { name: 'dark red' },
            'black-blue': { name: 'navy blue' },
            'black-yellow': { name: 'olive green' }
        };

        const result = colorRecipes[combination];
        const emojiMap = { red: '🔴', blue: '🔵', yellow: '🟡', white: '⚪', black: '⚫' };

        if (result) {
            await interaction.reply({
                content: `${emojiMap[first]} ${first} + ${emojiMap[second]} ${second} makes **${result.name}**`,
            });
        } else {
            await interaction.reply({
                content: `i genuinely have NO clue vro`,
                // ephemeral: true
            });
        }
    },
};