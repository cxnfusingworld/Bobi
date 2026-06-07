const fs = require('fs')
const path = require('path')
const configPath = path.join(__dirname, '../config.json')
let config = require(configPath)

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const GuildConfig = require('../models/GuildConfig.js') // Make sure this path points to your mongoose schema!

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('bot config and stuff')
        .setContexts([InteractionContextType.Guild])
        // Allow server managers/admins to see this command base
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        // 1. GET GLOBAL SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('get-global')
                .setDescription('gives u the current global bot config (Devs Only)')
        )

        // 2. SET GLOBAL SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-global')
                .setDescription('updates a global config setting (Devs Only)')
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

        // 3. GET SERVER SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('get-server')
                .setDescription('gives u the current server database config')
        )

        // 4. SET SERVER SUBCOMMAND
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-server')
                .setDescription('updates a server specific database config')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('the server module you want to toggle')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Random Messages Toggle', value: 'trollMessagesEnabled' },
                            { name: 'Censorship Toggle', value: 'foulLanguageFilter' }
                        )
                )
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Turn this feature True (On) or False (Off)')
                        .setRequired(true)
                )
        ),

    // AUTOCOMPLETE HANDLER (For global settings choices)
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase()
        const settingsKeys = Object.keys(config).filter(key => key !== 'developer_ids')
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
                    content: "<:scared:1511147876150018208> hey wait u aren't a dev! u can't manage global settings", 
                    ephemeral: true 
                })
            }
        }

        // ==========================================
        // SUBCOMMAND: get-global
        // ==========================================
        if (sub === 'get-global') {
            const configEmbed = new EmbedBuilder()
                .setTitle("Global Configuration")
                .setDescription("bot defaults and stuff")
                .setColor("Blurple")
                .setTimestamp()

            for (const [key, data] of Object.entries(config)) {
                if (key === 'developer_ids') continue

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
        // SUBCOMMAND: set-global
        // ==========================================
        if (sub === 'set-global') {
            const settingKey = interaction.options.getString('setting')
            let rawValue = interaction.options.getString('value')

            if (!config[settingKey]) {
                return await interaction.reply({ content: `❌ Global setting \`${settingKey}\` doesn't exist!`, ephemeral: true })
            }

            const targetSetting = config[settingKey]

            if (targetSetting.valueType === 'boolean') {
                if (rawValue.toLowerCase() === 'true') rawValue = true
                else if (rawValue.toLowerCase() === 'false') rawValue = false
                else return await interaction.reply({ content: `❌ This setting requires a boolean (\`true\` or \`false\`).`, ephemeral: true })
            } else if (targetSetting.valueType === 'number') {
                const parsedNum = Number(rawValue)
                if (isNaN(parsedNum)) return await interaction.reply({ content: `❌ This setting requires a valid number.`, ephemeral: true })
                rawValue = parsedNum
            }

            config[settingKey].value = rawValue
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4))

            return await interaction.reply({
                content: `✅ Successfully set global variable \`${settingKey}\` to \`${rawValue}\`!`,
                ephemeral: true
            })
        }

        // ==========================================
        // SUBCOMMAND: get-server
        // ==========================================
        if (sub === 'get-server') {
            await interaction.deferReply({ ephemeral: true })

            let serverSettings = await GuildConfig.findOne({ guildId: interaction.guild.id })
            if (!serverSettings) {
                serverSettings = await GuildConfig.create({ guildId: interaction.guild.id })
            }

            const embed = new EmbedBuilder()
                .setTitle(`⚙️ ${interaction.guild.name} Configuration`)
                .setDescription("Local server configs pulled directly from Bobi's Cloud Database.")
                .setColor("Orange")
                .addFields(
                    { 
                        name: "Chaotic Random Messages", 
                        value: serverSettings.trollMessagesEnabled ? "🟢 Enabled" : "🔴 Disabled", 
                        inline: true 
                    },
                    { 
                        name: "Foul Language Censorship", 
                        value: serverSettings.foulLanguageFilter ? "🟢 Active" : "🔴 Disabled", 
                        inline: true 
                    }
                )
                .setTimestamp()

            return await interaction.editReply({ embeds: [embed] })
        }

        // ==========================================
        // SUBCOMMAND: set-server
        // ==========================================
        if (sub === 'set-server') {
            await interaction.deferReply({ ephemeral: true })

            const settingKey = interaction.options.getString('setting')
            const targetValue = interaction.options.getBoolean('enabled')

            await GuildConfig.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { [settingKey]: targetValue },
                { upsert: true, new: true }
            )

            const cleanName = settingKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            return await interaction.editReply({
                content: `updated server setting **${cleanName}** to \`${targetValue ? 'enabled' : 'disabled'}\`!`
            })
        }
    },
}