const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello-world')
        .setDescription('//Gives you the basic luau code for printing "Hello World!"'),
    async execute(interaction) {

        await interaction.reply({
            content: '```lua\nprint("Hello World!"\n)```',
            ephemeral: true,
        })

    },
};