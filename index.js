/// Variables and Set Up \\\

require('dotenv').config()
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')

const utilities = path.join(__dirname, 'utilities')
const log = require(path.join(utilities, "logger.js"))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const commands = {}
const messageSentEvents = []

/// Functions \\\

async function initCommands() {

    log('Initializing and Deploying Commands...')

    const commandsPath = path.join(__dirname, 'commands')
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    const deployData = []

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)        
        const command = require(filePath)
        
        commands[command.data.name] = command
        
        deployData.push(command.data.toJSON())
        
        console.log(`Loaded command: /${command.data.name}`)
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN)
    try {
        log(`Refreshing ${deployData.length} application (/) commands on Discord...`)
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: deployData },
        )
        
        log('All commands registered successfully with Discord!')
    } catch (error) {
        log(`Failed to register slash commands with Discord: ${error}`, "error")
    
    }

}

async function initMessageEvents() {
    
    log('Initializing Message Sent Events...')

    const messageSentPath = path.join(__dirname, 'message-sent-events')
    const messageSentFiles = fs.readdirSync(messageSentPath).filter(file => file.endsWith('.js'))

    for (const file of messageSentFiles) {

        const filePath = path.join(messageSentPath, file)        
        const event = require(filePath)
        
        messageSentEvents.push(event)
        
        // console.log(`Loaded message sent event: /${event.data.name}`)
    }

    log('All message sent events initialized!')

}

async function onInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return

    const command = commands[interaction.commandName]

    if (command) {
        try {
            await command.execute(interaction)
        } catch (error) {
            log(`Error running command /${interaction.commandName}: ${error}`, "error")
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error trying to execute that command! ❌', ephemeral: true })
            } else {
                await interaction.reply({ content: 'There was an error trying to execute that command! ❌', ephemeral: true })
            }
        }
    }
}

async function onMessageSent(message) {

    console.log(message.content)
    
    for (const event of messageSentEvents) {
        event(message)
    }

}

/// Initialization \\\

// Loading
initCommands()
initMessageEvents()

// Events
client.on('interactionCreate', onInteraction)
client.on('messageCreate', onMessageSent)

client.once('clientReady', () => {
   log(`Logged in as ${client.user.tag}!`)
})

// Login
client.login(process.env.DISCORD_TOKEN)

// Uptime Handler
const express = require('express')
const { table } = require('console')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (_req, res) => {
    res.send('Bot Online')
})

app.listen(PORT, () => {
    log(`Listening on port ${PORT}`)
})