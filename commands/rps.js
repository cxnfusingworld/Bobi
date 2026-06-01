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
                    { name: 'rock', value: 'rock' },
                    { name: 'paper', value: 'paper' },
                    { name: 'scissors', value: 'scissors' }
                )),

    async execute(interaction) {
        const userChoice = interaction.options.getString('choice')
        
        const botChoices = ['rock', 'paper', 'scissors']
        let botChoice = botChoices[Math.floor(Math.random() * botChoices.length)]
        const funnyPick = Math.random()>0.95

        if (funnyPick) {
            botChoice = 'wd'
        }

        let result = ''
        if (userChoice === botChoice) {
            result = "damn we chose the same thing, its a tie ig\n-# in my opinion i won tho"
        } else if (
            (botChoice !== 'wd') &&
            ((userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper'))
        ) {
            result = 'you win *i guess*, play me again ima win'
        } else if (botChoice === 'wd') {
            result = 'you read that right.\n# <:innocent:1511136501927247993>'
        } else {
            result = 'i won, u lost to a **cat** lol\n# <:laughing:1511136962659094699>'
        }

        const emojiMap = { rock: 'rock 🪨', paper: 'paper 📄', scissors: 'scissors ✂️', wd: 'world domination.' }

        await interaction.reply({
            content: `u chose: ${emojiMap[userChoice]}\ni chose: ${emojiMap[botChoice]}\n\n${result}`,
            // ephemeral: true
        })
    }
}