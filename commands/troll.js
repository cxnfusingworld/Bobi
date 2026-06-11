const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js')
const emojis = require('../assets/emojis.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('troll')
        .setDescription('troll ppl for fun lol')
        .setContexts([
            InteractionContextType.Guild,
        ])
        
        // Fake Ban
        .addSubcommand(subcommand =>
            subcommand.setName('fake-ban')
                .setDescription('"ban" someone')
                .addUserOption(option => 
                    option.setName('target')
                        .setDescription('user to "ban"')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('reason they were "banned"')
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand()

        if (sub === 'fake-ban') {
            if (!interaction.inGuild()) {
                return await interaction.reply({
                    content: 'fake ban only works in servers with me added, mb 💔',
                    flags: MessageFlags.Ephemeral
                });
            }
            
            const allowedRoles = ['1455795090927780014'] 
            let allowedToUse = false

            if (interaction.member.permissions.has != null && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                allowedToUse = true
            }

            if (!allowedToUse) {
                allowedToUse = allowedRoles.some(roleID => interaction.member.roles.cache.has(roleID))
            }

            if (!allowedToUse) {                
                return await interaction.reply({
                    content: `u cant use this command ${emojis.no}`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const targetUser = interaction.options.getUser('target')
            
            const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }
            const discordTimestamp = new Date().toLocaleString('en-US', options).replace(',', '')

            const additionalReason = interaction.options.getString('reason')
            let description = `<@${targetUser.id}>`

            if (additionalReason) {
                description = description + `\nReason: ${additionalReason}`
            }

            const logEmbed = new EmbedBuilder()
                .setColor('#EE5C5C')
                .setAuthor({ 
                    name: `${targetUser.username}`, 
                    iconURL: targetUser.displayAvatarURL({ dynamic: true }) 
                })
                .setTitle('Member banned')
                .setDescription(description)
                .setFooter({ 
                    text: `ID: ${targetUser.id} • ${discordTimestamp}` 
                })

            await interaction.reply({ content: 'sure lol', flags: MessageFlags.Ephemeral })
            return await interaction.channel.send({ embeds: [logEmbed] })
        }
    },
}