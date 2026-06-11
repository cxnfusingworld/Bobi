const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js')
const fs = require('fs')
const path = require('path')

const GuildConfig = require('../models/GuildConfig.js') 

const configPath = path.join(__dirname, '../config.json')
let config = require(configPath)

const emojis = require('../assets/emojis.json')
const sendChannelLog = require('../utilities/channelLogger.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('bot config and stuff')
        .setContexts([InteractionContextType.Guild])
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        // GET GLOBAL SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('get-global')
                .setDescription('gives u the current global bot config (dev only)')
        )

        // SET GLOBAL SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-global')
                .setDescription('updates a global config setting (dev only)')
                .addStringOption(option => 
                    option.setName('setting')
                        .setDescription('the global setting you want to change')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('the new value for this setting')
                        .setRequired(true)
                )
        )

        // GET SERVER SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('get-server')
                .setDescription('gives u the current server database config')
        )

        // SET SERVER SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-server')
                .setDescription('updates a server specific config')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('the server setting you want to change')
                        .setAutocomplete(true) 
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('true/false | 0.5 -> 50% | 1000 -> 1 second | #channel')
                        .setRequired(true)
                )
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)
        const focusedValue = focusedOption.value.toLowerCase()
        
        const settingsKeys = Object.keys(config).filter(key => key !== 'developer_ids' && key !== 'whitelisted_servers')
        const filtered = settingsKeys.filter(key => key.toLowerCase().includes(focusedValue))

        await interaction.respond(
            filtered.slice(0, 25).map(key => ({ name: key.replace(/_/g, ' '), value: key }))
        )
    },

    async execute(interaction) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        const sub = interaction.options.getSubcommand()

        if (sub === 'get-global' || sub === 'set-global') {
            if (!config.developer_ids.includes(interaction.user.id)) {
                return await interaction.reply({ 
                    content: `${emojis.scared} hey wait u aren't a dev! u can't manage global settings`, 
                    flags: MessageFlags.Ephemeral
                })
            }
        }

        // ==========================================
        // SUBCOMMAND: GET-GLOBAL
        // ==========================================
        if (sub === 'get-global') {
            const configEmbed = new EmbedBuilder()
                .setTitle(`${emojis.settings} Global Configuration`)
                // .setDescription("default global settings")
                .setColor("Blurple")
                .setTimestamp()

            for (const [key, data] of Object.entries(config)) {
                if (key === 'developer_ids' || key === 'whitelisted_servers') continue
                if (data.valueType === 'channel') continue

                let visualValue = data.value
                if (data.displayType === 'percent') visualValue = `${data.value * 100}%`
                else if (data.displayType === 'ms') visualValue = `${data.value / 1000}s`
                else if (data.valueType === 'boolean') visualValue = data.value ? '🟢 Enabled' : '🔴 Disabled'
                else if (data.displayType === 'channel' && visualValue !== 'none') {
                    visualValue = `<#${visualValue}>`
                    key = key.replace('_id', '') 
                }
                if (data.displayType !== 'channel') visualValue = `\`${visualValue}\``

                const cleanName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                configEmbed.addFields({ name: cleanName, value: `\`${visualValue}\``, inline: true })
            }

            return await interaction.reply({ embeds: [configEmbed], flags: MessageFlags.Ephemeral })
        }

        // ==========================================
        // SUBCOMMAND: SET-GLOBAL
        // ==========================================
        if (sub === 'set-global') {
            const settingKey = interaction.options.getString('setting')
            let rawValue = interaction.options.getString('value')
            settingKey = settingKey.replaceAll(' ', '_')

            if (!config[settingKey]) {
                return await interaction.reply({ content: `global setting \`${settingKey}\` doesn't exist :(`, flags: MessageFlags.Ephemeral })
            }

            const targetSetting = config[settingKey]

            if (targetSetting.valueType === 'boolean') {
                if (rawValue.toLowerCase() === 'true') rawValue = true
                else if (rawValue.toLowerCase() === 'false') rawValue = false
                else return await interaction.reply({ content: `this setting requires a boolean (\`true\` or \`false\`)`, flags: MessageFlags.Ephemeral })
            } else if (targetSetting.valueType === 'number') {
                const parsedNum = Number(rawValue)
                if (isNaN(parsedNum)) return await interaction.reply({ content: `this setting requires a valid number`, flags: MessageFlags.Ephemeral })
                rawValue = parsedNum
            }

            config[settingKey].value = rawValue
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4))

            return await interaction.reply({
                content: `successfully set global variable \`${settingKey}\` to ${rawValue}`,
                flags: MessageFlags.Ephemeral
            })
        }

        // ==========================================
        // SUBCOMMAND: GET-SERVER
        // ==========================================
        if (sub === 'get-server') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral })

            let serverSettings = await GuildConfig.findOne({ guildId: interaction.guild.id })
            if (!serverSettings) {
                serverSettings = await GuildConfig.create({ guildId: interaction.guild.id })
            }

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.settings} ${interaction.guild.name} Configuration`)
                // .setDescription("server specific settings")
                .setColor("Orange")
                .setTimestamp()

            for (let [key, data] of Object.entries(config)) {
                if (key === 'developer_ids' || key === 'whitelisted_servers') continue
                if (data.valueType === 'channel') key = key+'_id'

                const dbValue = serverSettings[key] !== undefined ? serverSettings[key] : data.value

                let visualValue = dbValue
                if (data.displayType === 'percent') visualValue = `${dbValue * 100}%`
                else if (data.displayType === 'ms') visualValue = `${dbValue / 1000}s`
                else if (data.valueType === 'boolean') visualValue = dbValue ? '🟢 Enabled' : '🔴 Disabled'
                else if (data.displayType === 'channel') {
                    key = key.replaceAll('_id', '')
                    if (dbValue !== 'none') visualValue = `<#${dbValue}>`
                }

                const cleanName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                if (data.displayType !== 'channel') visualValue = `\`${visualValue}\``
                embed.addFields({ name: cleanName, value: `${visualValue}`, inline: true })
            }

            return await interaction.editReply({ embeds: [embed] })
        }

        // ==========================================
        // SUBCOMMAND: SET-SERVER
        // ==========================================
        if (sub === 'set-server') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral })

            let settingKey = interaction.options.getString('setting')
            let rawValue = interaction.options.getString('value')
            settingKey = settingKey.replaceAll(' ', '_')

            if (!config[settingKey]) {
                return await interaction.editReply({ content: `hmm that setting doesnt exist 🤔` })
            }

            if (settingKey === 'developer_ids' || settingKey === 'whitelisted_servers') {
                return await interaction.editReply({ content: `u cant edit that ${emojis.no}` })
            }

            const targetSetting = config[settingKey]

            if (targetSetting.valueType === 'boolean') {
                if (rawValue.toLowerCase() === 'true') rawValue = true
                else if (rawValue.toLowerCase() === 'false') rawValue = false
                else return await interaction.editReply({ content: `this setting requires a boolean (\`true\` or \`false\`)` })
            } else if (targetSetting.valueType === 'number') {
                const parsedNum = Number(rawValue)
                if (isNaN(parsedNum)) return await interaction.editReply({ content: `this setting requires a valid numeric value` })
                rawValue = parsedNum
            } else if (targetSetting.valueType === 'channel') {
                settingKey = settingKey+'_id'
                rawValue = rawValue.replace(/[^\d]/g, '')
                if (!rawValue || rawValue.length < 17) {
                    return await interaction.editReply({ content: `please provide a valid channel mention or channel ID` })
                }
            }

            const serverSettings = await GuildConfig.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { [settingKey]: rawValue },
                { upsert: true, new: true }
            )
            
            if (targetSetting.displayType === 'channel') settingKey = settingKey.replaceAll('_id', '')

            const cleanName = key => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            const formattedName = cleanName(settingKey)
            
            let visualValue = rawValue
            if (targetSetting.displayType === 'percent') visualValue = `${rawValue * 100}%`
            else if (targetSetting.displayType === 'ms') visualValue = `${rawValue / 1000}s`
            else if (targetSetting.valueType === 'boolean') visualValue = rawValue ? '🟢 Enabled' : '🔴 Disabled'
            else if (targetSetting.displayType === 'channel') visualValue = `<#${rawValue}>`
            
            if (targetSetting.displayType !== 'channel') visualValue = `\`${visualValue}\``

            try {
                const logChannelId = serverSettings.server_log_channel_id
                if (logChannelId && logChannelId !== 'none') {
                    const logChannel = await interaction.guild.channels.fetch(logChannelId)
                    if (logChannel) {
                        await sendChannelLog(logChannel, {
                            title: `${emojis.settings} Configuration Updated`,
                            description: `A server setting was modified by ${interaction.user}`,
                            color: "Orange",
                            fields: [
                                { name: "Setting", value: `\`${formattedName}\``, inline: true },
                                { name: "New Value", value: visualValue, inline: true }
                            ]
                        })
                    }
                }
            } catch (auditError) {
                console.error("Failed to send server audit log:", auditError)
            }

            return await interaction.editReply({
                content: `successfully updated server setting **${formattedName}** to ${visualValue}!`
            })
        }
    }
}