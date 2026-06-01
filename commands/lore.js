const { SlashCommandBuilder } = require('discord.js')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('gives you bobi\'s lore'),
    async execute(interaction) {
        
        const targetCommand = interaction.client.application.commands.cache.find(cmd => cmd.name === 'selfie')
        var selfieCommand

        if (targetCommand)
            selfieCommand = `</selfie:${targetCommand.id}>`
        else
            selfieCommand = '`\u200B/selfie`'

        interaction.reply({
            content: `*cough* alright then..
bobi was a **stray cat**, and *technically* still is.
she lives in texas, and you can usually find her on the back porch
her *favorite* activity is probably.. rolling in the sand and then trying to get someone to pet her
oh and eating of course.
her diet consists of cat food, and milk.

anyways, since shes a stray, no one really knows how old she is 🤔🤔
so your guess is as good as mine..

if you want to see some cute pictures of her, use the ${selfieCommand} command!`
        })        
    },
}