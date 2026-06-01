const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    // 1. Define the command and its arguments (options)
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('rock paper scissors')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('watcha gonna play??')
                .setRequired(true)
                .addChoices(
                    { name: 'Rock', value: 'rock' },
                    { name: 'Paper', value: 'paper' },
                    { name: 'Scissors', value: 'scissors' }
                )),

    // 2. The game logic
    async execute(interaction) {
        // Grab what the user chose from the argument
        const userChoice = interaction.options.getString('choice')
        
        // Let Goober pick randomly
        const botChoices = ['rock', 'paper', 'scissors']
        const botChoice = botChoices[Math.floor(Math.random() * botChoices.length)]

        // Determine the winner
        let result = ''
        if (userChoice === botChoice) {
            result = "It's a tie!"
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'you win i guess, play me again ima win'
        } else {
            result = 'i won you suck'
        }

        // Format emojis for the final message
        const emojiMap = { rock: 'rock 🪨', paper: 'paper 📄', scissors: 'scissors ✂️' }

        // 3. Reply to the user privately
        await interaction.reply({
            content: `u chose: ${emojiMap[userChoice]}\ni chose: ${emojiMap[botChoice]}\n\n${result}`,
            // ephemeral: true
        })
    }
}