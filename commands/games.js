const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType,
    InteractionContextType,
    EmbedBuilder,
    MessageFlags
} = require('discord.js')
const emojis = require("../assets/emojis.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('games')
        .setDescription('play games')
        .addSubcommand(subcommand =>
            subcommand.setName('tic-tac-toe')
                .setDescription('challenge someone (or bobi) to a game of tic-tac-toe')
                .addUserOption(option =>
                    option.setName('opponent')
                        .setDescription('the person you want to play against (leave blank to play bobi)')
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('rock-paper-scissors')
                .setDescription('rock paper scissors')
                .addUserOption(option =>
                    option.setName('opponent')
                        .setDescription('the person you want to play against (leave blank to play bobi)')
                )
        )
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel,
            InteractionContextType.BotDM,
        ]),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand()

        if (sub === 'tic-tac-toe') {

            const challenger = interaction.user
            let opponent = interaction.options.getUser('opponent')
            let isAiGame = false

            if (!opponent) {
                opponent = interaction.client.user
                isAiGame = true
            }

            if (!isAiGame && (opponent.bot || opponent.id === challenger.id)) {
                return interaction.reply({ content: `you cant play against a bot or urself ${emojis.no}`, flags: MessageFlags.Ephemeral })
            }

            let board = Array(9).fill(' ')
            let currentTurn = challenger.id

            function createBoardComponents() {
                const rows = []
                for (let i = 0; i < 3; i++) {
                    const row = new ActionRowBuilder()
                    for (let j = 0; j < 3; j++) {
                        const index = i * 3 + j
                        const cellValue = board[index]

                        const button = new ButtonBuilder()
                            .setCustomId(`ttt_${index}`)
                            .setLabel(cellValue === ' ' ? '-' : cellValue)
                            .setDisabled(cellValue !== ' ')

                        if (cellValue === 'X') button.setStyle(ButtonStyle.Primary) 
                        else if (cellValue === 'O') button.setStyle(ButtonStyle.Danger) 
                        else button.setStyle(ButtonStyle.Secondary) 

                        row.addComponents(button)
                    }
                    rows.push(row)
                }
                return rows
            }

            function checkWinner() {
                const winConditions = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                    [0, 4, 8], [2, 4, 6]             
                ]

                for (const condition of winConditions) {
                    const [a, b, c] = condition
                    if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
                        return board[a] 
                    }
                }

                if (!board.includes(' ')) return 'tie'
                return null
            }

            function makeAiMove() {
                const availableIndices = []
                board.forEach((val, index) => {
                    if (val === ' ') availableIndices.push(index)
                })

                if (availableIndices.length === 0) return null

                const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
                board[randomIndex] = 'O'
                return randomIndex
            }

            const opponentDisplay = isAiGame ? 'bobi' : opponent
            const response = await interaction.reply({
                content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${challenger} (❌) vs ${opponentDisplay}\nwaiting for a move...`,
                components: createBoardComponents(),
                allowedMentions: { parse: [] }
            })

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000 
            })

            collector.on('collect', async btnInteraction => {
                if (btnInteraction.user.id !== currentTurn) {
                    return btnInteraction.reply({ content: `nuh uh wait ur turn ${emojis.no}`, flags: MessageFlags.Ephemeral })
                }

                const index = parseInt(btnInteraction.customId.split('_')[1])
                board[index] = 'X'

                let gameResult = checkWinner()

                if (gameResult) {
                    collector.stop()
                    const finalComponents = createBoardComponents().map(row => {
                        row.components.forEach(btn => btn.setDisabled(true))
                        return row
                    })

                    if (gameResult === 'tie') {
                        return btnInteraction.update({
                            content: `### 🤝 game over: its a tie\nplay again ${challenger} and ${opponentDisplay}, i wanna see someone lose`,
                            components: finalComponents
                        })
                    } else {
                        if (isAiGame) {
                            return btnInteraction.update({
                                content: `### 💔 game over: ${challenger} wins\nits rigged istg ${emojis.why}`,
                                components: finalComponents
                            })
                        }
                        return btnInteraction.update({
                            content: `### 🎉 game over: ${challenger} wins\nL ${opponentDisplay} lmao`,
                            components: finalComponents
                        })
                    }
                }

                if (isAiGame) {
                    await btnInteraction.update({
                        content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${opponentDisplay} (⭕) is thinking...`,
                        components: createBoardComponents().map(row => {
                            row.components.forEach(btn => btn.setDisabled(true))
                            return row
                        })
                    })

                    // await new Promise(resolve => setTimeout(resolve, 1000))

                    makeAiMove()
                    gameResult = checkWinner()

                    if (gameResult) {
                        collector.stop()
                        const finalComponents = createBoardComponents().map(row => {
                            row.components.forEach(btn => btn.setDisabled(true))
                            return row
                        })

                        if (gameResult === 'tie') {
                            return interaction.editReply({
                                content: `### 🤝 game over: its a tie\nill win next time..`,
                                components: finalComponents,
                                allowedMentions: { parse: [] }
                            })
                        } else {
                            return interaction.editReply({
                                content: `### 🎉 game over: ${opponentDisplay} wins!\nlmao u lost ${emojis.laughing}`,
                                components: finalComponents,
                                allowedMentions: { parse: [] }
                            })
                        }
                    }

                    currentTurn = challenger.id
                    await interaction.editReply({
                        content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${challenger} (❌)`,
                        components: createBoardComponents(),
                        allowedMentions: { parse: [] }
                    })

                } else {
                    currentTurn = opponent.id
                    await btnInteraction.update({
                        content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${opponent} (⭕)`,
                        components: createBoardComponents(),
                    })
                }
            })

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    const finalComponents = createBoardComponents().map(row => {
                        row.components.forEach(btn => btn.setDisabled(true))
                        return row
                    })
                    await interaction.editReply({
                        content: `### ⏰ game over\nyall took too long i got bored`,
                        components: finalComponents,
                        allowedMentions: { parse: [] }
                    })
                }
            })

        } else if (sub === 'rock-paper-scissors') {
            let challenger = interaction.user
            let opponent = interaction.options.getUser('opponent')
            const isAiGame = (opponent === null || opponent === interaction.client.user)

            if (isAiGame) opponent = interaction.client.user

            const actionRow = new ActionRowBuilder()
            const choices = ['rock', 'paper', 'scissors']
            const buttons = []

            choices.forEach(choice => {
                const button = new ButtonBuilder()
                    .setCustomId(choice)
                    .setLabel(choice)
                    .setStyle(ButtonStyle.Primary)
                buttons.push(button)
            })
            actionRow.addComponents(buttons)

            let result = null
            let challengerChoice = null
            let opponentChoice = null

            const gameEmbed = new EmbedBuilder()
                .setTitle('🪨📄✂️ rock paper scissors')
                .setColor('Blurple')
                .setDescription(`<@${challenger.id}> vs. <@${opponent.id}>\n\nmake ur choices...`)

            const response = await interaction.reply({
                embeds: [gameEmbed],                
                components: [actionRow],
                allowedMentions: { parse: [] }
            })

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000
            })

            if (isAiGame) {
                const funnyPick = Math.random() > 0.97
                opponentChoice = choices[Math.floor(Math.random() * choices.length)]
                if (funnyPick) {
                    opponentChoice = 'wd'
                }
            }

            collector.on('collect', async btnInteraction => {
                if (btnInteraction.user.id !== challenger.id && btnInteraction.user.id !== opponent.id) {
                    return btnInteraction.reply({ content: `ur not playing ${emojis.no}`, flags: MessageFlags.Ephemeral })
                }                
                if ((btnInteraction.user.id === challenger.id && challengerChoice !== null) ||
                    (btnInteraction.user.id === opponent.id && opponentChoice !== null)) {
                    return btnInteraction.reply({ content: `u already made a choice ${emojis.no}`, flags: MessageFlags.Ephemeral })
                }
                
                if (btnInteraction.user.id === challenger.id) {
                    challengerChoice = btnInteraction.customId
                } else if (btnInteraction.user.id === opponent.id) {
                    opponentChoice = btnInteraction.customId
                }

                if (opponentChoice !== null && challengerChoice !== null) {
                    if (challengerChoice === opponentChoice) {
                        result = "damn yall chose the same thing, its a tie lol"
                    } else if (
                        ((challengerChoice === 'rock' && opponentChoice === 'scissors') ||
                        (challengerChoice === 'paper' && opponentChoice === 'rock') ||
                        (challengerChoice === 'scissors' && opponentChoice === 'paper'))
                    ) {
                        result = `<@${challenger.id}> wins\n-# L ${opponent.username} ${emojis.laughing}`
                    } else {
                        result = `<@${opponent.id}> wins\n-# L ${challenger.username} ${emojis.laughing}`
                    }
                    collector.stop()
                } else {
                    const statusDescription = `<@${challenger.id}> vs. <@${opponent.id}>\n\n` +
                        `${challengerChoice ? '✅' : '⏳'} <@${challenger.id}> ${challengerChoice ? 'made a choice' : 'is choosing...'}\n` +
                        `${opponentChoice ? '✅' : '⏳'} <@${opponent.id}> ${opponentChoice ? 'made a choice' : 'is choosing...'}`
                    
                    await btnInteraction.update({
                        embeds: [EmbedBuilder.from(gameEmbed).setDescription(statusDescription)]
                    })
                }
            })

            const emojiMap = { rock: 'rock 🪨', paper: 'paper 📄', scissors: 'scissors ✂️', wd: 'world domination 🐾🌎', none: 'none' }

            collector.on('end', async function (collected, reason) {
                if (reason === 'time') {
                    challengerChoice = challengerChoice || 'none'
                    opponentChoice = opponentChoice || 'none'                    
                    result = `yall took too long lol`
                } else if (opponent.id === interaction.client.user.id) {
                    if (challengerChoice === opponentChoice) {
                        result = "damn we chose the same thing, its a tie ig\n-# in my opinion i won tho"
                    } else if (
                        (opponentChoice !== 'wd') &&
                        ((challengerChoice === 'rock' && opponentChoice === 'scissors') ||
                        (challengerChoice === 'paper' && opponentChoice === 'rock') ||
                        (challengerChoice === 'scissors' && opponentChoice === 'paper'))
                    ) {
                        result = `you win *i guess* ${emojis.why}\nplay me again ima win`
                    } else if (opponentChoice === 'wd') {
                        result = `you read that right. ${emojis.innocent}`
                    } else {
                        result = `i won, u lost to a **cat** lol ${emojis.laughing}`
                    }
                }

                let challengerWon = result.includes(opponent.username) || result.includes('you win *i guess*')
                let color = challengerWon ? '#55FF55' : '#FF5555'

                if (result.includes('tie')) {
                    color = '#ffc037'
                }

                const endEmbed = new EmbedBuilder()
                    .setTitle('🪨📄✂️ rock paper scissors')
                    .setColor(color)
                    .addFields(
                        { name: `${challenger.username}`, value: emojiMap[challengerChoice], inline: true },
                        { name: `${opponent.username}`, value: emojiMap[opponentChoice], inline: true },
                        { name: 'result...', value: result, inline: false }
                    )

                await interaction.editReply({
                    embeds: [endEmbed],
                    components: [],
                    allowedMentions: { parse: [] }
                })
            })
        }
    }
}