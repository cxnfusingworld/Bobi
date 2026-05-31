/// Variables and Set Up \\\

require('dotenv').config()
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')

const utilities = path.join(__dirname, 'utilities')
const log: (message: string, logType: "error" | "warn" | void) => void = require(path.join(utilities, "logger.js"))

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const commands: {
    [name: string]: {
        data: any,
        execute: (interaction: any) => void
    }
} = {}

/// Functions \\\


// 1. Scans folder, loads modules locally, and registers them directly to Discord
async function initCommands() {
    log('Initializing and Deploying Commands...')

    const commandsPath = path.join(__dirname, 'commands')
    const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.js'))

    const deployData = [] // Array to hold raw JSON data for Discord's API

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)        
        const command = require(filePath)
        
        // Save to our local execution dictionary
        commands[command.data.name] = command
        
        // Save to our deploy list for Discord
        deployData.push(command.data.toJSON())
        
        console.log(`Loaded command: /${command.data.name}`)
    }

    // Push the loaded commands to Discord's servers automatically
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

async function onInteraction(interaction: any) {
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

/// Initialization \\\

// Loading
initCommands()

// Events
client.on('interactionCreate', onInteraction)

client.once('clientReady', () => {
   log(`Logged in as ${client.user.tag}!`)
})

// Login
client.login(process.env.DISCORD_TOKEN)

// Uptime Handler
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (_req: any, res: any) => {
    res.send('Bot Online')
})

app.listen(PORT, () => {
    log(`Listening on port ${PORT}`)
})