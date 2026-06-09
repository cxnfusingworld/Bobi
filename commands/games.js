const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType,
    InteractionContextType
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
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.PrivateChannel
        ]),
    async execute(interaction) {
        const challenger = interaction.user
        let opponent = interaction.options.getUser('opponent')
        let isAiGame = false

        if (!opponent) {
            opponent = interaction.client.user
            isAiGame = true
        }

        if (!isAiGame && (opponent.bot || opponent.id === challenger.id)) {
            return interaction.reply({ content: `you cant play against a bot or urself ${emojis.no}`, ephemeral: true })
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
                return btnInteraction.reply({ content: `nuh uh wait ur turn ${emojis.no}`, ephemeral: true })
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
                            components: finalComponents
                        })
                    } else {
                        return interaction.editReply({
                            content: `### 🎉 game over: ${opponentDisplay} wins!\nlmao u lost ${emojis.laughing}`,
                            components: finalComponents
                        })
                    }
                }

                currentTurn = challenger.id
                await interaction.editReply({
                    content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${challenger} (❌)`,
                    components: createBoardComponents()
                })

            } else {
                currentTurn = opponent.id
                await btnInteraction.update({
                    content: `### ❌ Tic-Tac-Toe ⭕\n**turn:** ${opponent} (⭕)`,
                    components: createBoardComponents()
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
                    components: finalComponents
                })
            }
        })
    }
}