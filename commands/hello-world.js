const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello-world')
        .setDescription('gives you basic code for printing "Hello World!"')
        .addStringOption(option => 
            option.setName("language")
                .setDescription('code language to print "Hello World!" in')
                .addChoices(
                    { name: 'Luau', value: 'luau' },
                    { name: 'JavaScript', value: 'js' },
                    { name: 'Python', value: 'python' },
                    { name: 'C++', value: 'cpp' },
                    { name: 'C#', value: 'csharp' },
                    { name: 'HTML/CSS', value: 'html' }
                )
        )
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    async execute(interaction) {
        const language = interaction.options.getString("language") || "luau"
        let final = ''

        if (language === "luau") {
            final = '```lua\nprint("Hello World!")\n```'
        } else if (language === "js") {
            final = '```javascript\nconsole.log("Hello World!");\n```'
        } else if (language === "python") {
            final = '```python\nprint("Hello World!")\n```'
        } else if (language === "cpp") {
            final = '```cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World!\\n"\n    return 0\n}\n```'
        } else if (language === "csharp") {
            final = '```csharp\nConsole.WriteLine("Hello, World!");\n```'
        } else if (language === "html") {
            final = '```html\n<!DOCTYPE html>\n<html>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>\n```'
        }

        await interaction.reply({
            content: final,
            // ephemeral: true,
        })
    },
}