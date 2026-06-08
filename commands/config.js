const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const fs = require('fs')
const path = require('path')

const GuildConfig = require('../models/GuildConfig.js') 

const configPath = path.join(__dirname, '../config.json')
let config = require(configPath)

const emojis = require('../assets/emojis.json')
const sendChannelLog = require('../utils/loggerHelper.js')

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
                        .setDescription('true/false | 0.5 -> 50% | 1000 -> 1 second')
                        .setRequired(true)
                )
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)
        const focusedValue = focusedOption.value.toLowerCase()
        
        // FIXED: Removed the boolean restriction so server settings display numbers/percentages too
        const settingsKeys = Object.keys(config).filter(key => (key !== 'developer_ids' && key !== 'whitelisted_servers'))
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
                    ephemeral: true 
                })
            }
        }

        // ==========================================
        // SUBCOMMAND: GET-GLOBAL
        // ==========================================
        if (sub === 'get-global') {
            const configEmbed = new EmbedBuilder()
                .setTitle("⚙️ Bobi Global Configuration")
                .setDescription("default global settings")
                .setColor("Blurple")
                .setTimestamp()

            for (const [key, data] of Object.entries(config)) {
                if (key === 'developer_ids' || key === 'whitelisted_servers') continue

                let displayValue = data.value
                if (data.displayType === 'percent') displayValue = `${data.value * 100}%`
                else if (data.displayType === 'ms') displayValue = `${data.value / 1000}s`
                else if (data.valueType === 'boolean') displayValue = data.value ? '🟢 Enabled' : '🔴 Disabled'

                const cleanName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                configEmbed.addFields({ name: cleanName, value: `\`${displayValue}\``, inline: true })
            }

            return await interaction.reply({ embeds: [configEmbed], ephemeral: true })
        }

        // ==========================================
        // SUBCOMMAND: SET-GLOBAL
        // ==========================================
        if (sub === 'set-global') {
            const settingKey = interaction.options.getString('setting')
            let rawValue = interaction.options.getString('value')

            if (!config[settingKey]) {
                return await interaction.reply({ content: `global setting \`${settingKey}\` doesn't exist :(`, ephemeral: true })
            }

            const targetSetting = config[settingKey]

            if (targetSetting.valueType === 'boolean') {
                if (rawValue.toLowerCase() === 'true') rawValue = true
                else if (rawValue.toLowerCase() === 'false') rawValue = false
                else return await interaction.reply({ content: `this setting requires a boolean (\`true\` or \`false\`)`, ephemeral: true })
            } else if (targetSetting.valueType === 'number') {
                const parsedNum = Number(rawValue)
                if (isNaN(parsedNum)) return await interaction.reply({ content: `this setting requires a valid number`, ephemeral: true })
                rawValue = parsedNum
            }

            config[settingKey].value = rawValue
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4))

            return await interaction.reply({
                content: `successfully set global variable \`${settingKey}\` to \`${rawValue}\``,
                ephemeral: true
            })
        }

        // ==========================================
        // SUBCOMMAND: GET-SERVER
        // ==========================================
        if (sub === 'get-server') {
            await interaction.deferReply({ ephemeral: true })

            let serverSettings = await GuildConfig.findOne({ guildId: interaction.guild.id })
            if (!serverSettings) {
                serverSettings = await GuildConfig.create({ guildId: interaction.guild.id })
            }

            const embed = new EmbedBuilder()
                .setTitle(`⚙️ ${interaction.guild.name} Configuration`)
                .setDescription("server specific settings")
                .setColor("Orange")
                .setTimestamp()

            for (const [key, data] of Object.entries(config)) {
                if (key === 'developer_ids' || key === 'whitelisted_servers') continue

                // Fall back to fallback global configuration value if server hasn't overwritten it yet
                const dbValue = serverSettings[key] !== undefined ? serverSettings[key] : data.value

                let displayValue = dbValue
                if (data.displayType === 'percent') displayValue = `${dbValue * 100}%`
                else if (data.displayType === 'ms') displayValue = `${dbValue / 1000}s`
                else if (data.valueType === 'boolean') displayValue = dbValue ? '🟢 Enabled' : '🔴 Disabled'

                const cleanName = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                embed.addFields({ name: cleanName, value: `\`${displayValue}\``, inline: true })
            }

            return await interaction.editReply({ embeds: [embed] })
        }

        // ==========================================
        // SUBCOMMAND: SET-SERVER
        // ==========================================
        if (sub === 'set-server') {
            await interaction.deferReply({ ephemeral: true })

            const settingKey = interaction.options.getString('setting')
            let rawValue = interaction.options.getString('value')

            if (!config[settingKey]) {
                return await interaction.editReply({ content: `hmm that setting doesnt exist 🤔` })
            }

            const targetSetting = config[settingKey]
            if (settingKey === 'developer_ids' || settingKey === 'whitelisted_servers') {
                return await interaction.editReply({ content: `u cant edit that <a:no:1511098533984604171>` })
            }

            if (targetSetting.valueType === 'boolean') {
                if (rawValue.toLowerCase() === 'true') rawValue = true
                else if (rawValue.toLowerCase() === 'false') rawValue = false
                else return await interaction.editReply({ content: `this setting requires a boolean (\`true\` or \`false\`)` })
            } else if (targetSetting.valueType === 'number') {
                const parsedNum = Number(rawValue)
                if (isNaN(parsedNum)) return await interaction.editReply({ content: `this setting requires a valid numeric value` })
                rawValue = parsedNum
            }

            let serverSettings = await GuildConfig.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { [settingKey]: rawValue },
                { upsert: true, new: true }
            )

            const cleanName = settingKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            
            let visualValue = rawValue
            if (targetSetting.displayType === 'percent') visualValue = `${rawValue * 100}%`
            else if (targetSetting.displayType === 'ms') visualValue = `${rawValue / 1000}s`
            else if (targetSetting.valueType === 'boolean') visualValue = rawValue ? 'ENABLED' : 'DISABLED'

            try {
                const logChannelId = serverSettings.server_log_channel_id
                if (logChannelId && logChannelId !== 'none') {
                    const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null)
                    if (logChannel) {
                        await sendChannelLog(logChannel, {
                            title: "⚙️ Configuration Updated",
                            description: `A server setting was modified by ${interaction.user}`,
                            color: "Orange",
                            fields: [
                                { name: "Setting", value: `\`${cleanName}\``, inline: true },
                                { name: "New Value", value: `\`${visualValue}\``, inline: true }
                            ]
                        })
                    }
                }
            } catch (auditError) {
                console.error("Failed to send server audit log:", auditError)
            }

            await interaction.editReply({
                content: `successfully updated server setting **${cleanName}** to \`${visualValue}\`!`
            })
        }
    },
}