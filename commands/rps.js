const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    // 1. Define the command and its arguments (options)
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors with Goober!')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Your move')
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
            result = 'You win! 🎉'
        } else {
            result = 'Goober wins! 🤖'
        }

        // Format emojis for the final message
        const emojiMap = { rock: 'Rock 🪨', paper: 'Paper 📄', scissors: 'Scissors ✂️' }

        // 3. Reply to the user privately
        await interaction.reply({
            content: `**Rock, Paper, Scissors!**\n\nYou chose: ${emojiMap[userChoice]}\nGoober chose: ${emojiMap[botChoice]}\n\n**Result:** ${result}`,
            ephemeral: true // <-- THIS makes the message private (Only you can see this)
        })
    }
}