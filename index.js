/// Variables and Set Up \\\

require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs') // Built-in Node.js module to read files
const path = require('path') // Built-in module to handle file paths safely

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const commands = {}

/// Functions \\\

function log(message) {
    console.log(`=== Bot Log ===\n\n${message}\n\n===============`)
}

function initCommands() {
    log('Initializing Commands...')

    const commandsPath = path.join(__dirname, 'commands')
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        
        const command = require(filePath)
        
        commands[command.data.name] = command
        
        console.log(`Loaded command: /${command.data.name}`)
    }
    
    log('All commands loaded successfully!')
}

async function onInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = commands[interaction.commandName]

    if (command) {
        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(`Error running command /${interaction.commandName}:`, error)
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error trying to execute that command! ❌', ephemeral: true })
            } else {
                await interaction.reply({ content: 'There was an error trying to execute that command! ❌', ephemeral: true })
            }
        }
    }
}

/// Initialization \\\

// Loading
initCommands()

// Events
client.on('interactionCreate', onInteraction)

client.once('ready', () => {
   log(`Logged in as ${client.user.tag}!`)
})

// Login
client.login(process.env.DISCORD_TOKEN)

// Uptime Handler
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Bot Online')
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})