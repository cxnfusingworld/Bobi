const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

// 1. Define answers with weights. Higher weight = more common.
const answers = [
    
    { text: "ofc vro", weight: 15 },
    { text: "definitely", weight: 15 },
    { text: "yeah probs", weight: 10 },
    { text: "hmm... i think so", weight: 10 },

    { text: "wait lemme take a nap rq", weight: 10 },
    { text: "idk, im just a cat", weight: 10 },
    { text: "WAIT SHUSH i think i js saw a mouse", weight: 5 },

    { text: "dont count on it lol", weight: 10 },
    { text: "my sources say 🤔🤔 nah", weight: 10 },
    { text: "absolutely not.", weight: 1 },

    { text: "not unless you promise global world domination.\n# <:innocent:1511136501927247993>", weight: 2 },
    { text: "HELL YEAHHHH\n# <:yes:1511222363994325134>", weight: 1 },
    { text: "... never talk to me again\n# <:scared:1511147876150018208>", weight: 1 } 

]

function getWeightedAnswer() {
    const totalWeight = answers.reduce((sum, answer) => sum + answer.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const answer of answers) {
        random -= answer.weight
        if (random <= 0) {
            return answer.text
        }
    }
    
    return answers[0].text
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('ask me a yes/no question and get a magic answer')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('what do u want to ask??')
                .setRequired(true)
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction) {
        await interaction.reply("thinking...")

        const question = interaction.options.getString('question')
        const randomAnswer = getWeightedAnswer()

        await interaction.editReply({
            content: `-#Q: *${question}*\nA: ${randomAnswer}`
        })
    }
}