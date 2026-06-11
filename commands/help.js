const { SlashCommandBuilder, InteractionContextType, MessageFlags, Colors, AttachmentBuilder } = require('discord.js')
const ComponentBuilder = require('../utilities/v2Helper')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('info and guides')
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
        ]),
    async execute(interaction) {

        const bobiImageFile = new AttachmentBuilder(
            path.join(__dirname, '../assets/selfie/bobi2.jpg'),
            { name: 'bobi.jpg' }
        )

        let commands = {}
        for (const [id, commandData] of await interaction.client.application.commands.fetch()) {
            commands[commandData.name] = id
        }

        const layout = new ComponentBuilder()
            .setColor(Colors.Gold)
            .addImages([bobiImageFile])


            .addText('# bobi')
            .addDivider('Small')


            .addText(`## commands`)

            .addText(`### information`)
            .addText(`get help: </help:${commands['help']}>`)
            .addText(`get ping: </ping:${commands['ping']}>`)
            .addText(`bobi's lore: </lore:${commands['lore']}>`)
            
            .addText(`### fun`)
            .addText(`cat facts: </fact:${commands['fact']}>`)
            .addText(`cat pictures: </cat-picture:${commands['cat-picture']}>`)
            .addText(`selfie: </selfie:${commands['selfie']}>`)
            .addText(`8 ball: </8ball:${commands['8ball']}>`)
            .addText(`ask anything: </ask:${commands['ask']}>`)
            .addText(`how to hello world: </hello-world:${commands['hello-world']}>`)
            .addText(`mix colors: </mix:${commands['mix']}>`)
            .addText(`server info: </discord server-info:${commands['discord']}>`)
            .addText(`roblox game info: </roblox experience:${commands['roblox']}>`)
            .addText(`roblox user info: </roblox user:${commands['roblox']}>`)

            .addText(`### games`)
            .addText(`rock paper scissors: </games rock-paper-scissors:${commands['games']}>`)
            .addText(`tic tac toe: </games tic-tac-toe:${commands['games']}>`)
            
            .addText(`### support`)
            .addText(`links: </links:${commands['links']}>`)
            .addText(`donate: </donate:${commands['donate']}>`)

            // .addDivider('Small')

            .setEphemeral()
            .build()
        
        await interaction.reply(layout)        
    },
}