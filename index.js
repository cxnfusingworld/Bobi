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

const whitelistedServers = ['1510727709473509426', '1440792579351515188']

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

            const errorMessage = 'hmm smth broke 🤔🤔 try again in a bit'
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true })
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true })
            }
        }
    }
}

async function onMessageSent(message) {
    
    for (const event of messageSentEvents) {
        event(message)
    }

}

async function checkGuildAccess(guild) {

    console.log(`Checking whitelisted server ${guild.name}...`)

    if (!whitelistedServers.includes(guild.id)) {
        log(`Unauthorized access detected in server: ${guild.name} (${guild.id}). Leaving...`, "warn")
        try {
            const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('SendMessages'))
            
            if (systemChannel) {
                await systemChannel.send("<:scared:1511147876150018208> wth where am i?? im leaving cya\n-# if you want bobi in this server DM @cxnfusion")
            }
        } catch (err) {
            log(`Could not send goodbye message in ${guild.name}: ${err.message}`)
        }
        await guild.leave()
    }
}

/// Initialization \\\

// Loading
initCommands()
initMessageEvents()

// Events
client.on('interactionCreate', onInteraction)
client.on('messageCreate', onMessageSent)

client.once('ready', async () => {

    log(`Logged in as ${client.user.tag}!`)
   
    log(`Checking whitelisted servers...`)
    for (const [id, guild] of client.guilds.cache) await checkGuildAccess(guild)
    log(`All servers checked!`)

})

// Login
client.login(process.env.DISCORD_TOKEN)

// Server Check
client.on('guildCreate', async (guild) => {
    await checkGuildAccess(guild)
})

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