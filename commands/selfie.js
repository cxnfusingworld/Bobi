const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

const urls = [
    'https://cdn.discordapp.com/attachments/1508630000088256723/1510844667439087616/20260531_190959.jpg?ex=6a1e4b3e&is=6a1cf9be&hm=b1f8fdb276b210d4102f6dd464a7799aafbc9e8260d283ad624aaad8a82a832b&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1509659207446560909/20260528_144205.jpg?ex=6a1defb3&is=6a1c9e33&hm=360bd7f2e7352be71a4fb1149e15f70c32ef5a5d979a8af45870ae8185905a4b&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1509659207828504576/20260528_143539.jpg?ex=6a1defb3&is=6a1c9e33&hm=c4848eef5b91913d6ed83c4e1728b8c70280b4ffc21de67b51e59f7e0c1a4205&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1509659208604188813/20260528_143729.jpg?ex=6a1defb3&is=6a1c9e33&hm=5e0420bf0d0c4e9cf16fed35c78a3ab04127c984b0e004ab3ba2dc5264039ee5&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1509659327458443408/20260528_1441421.jpg?ex=6a1defcf&is=6a1c9e4f&hm=6618e0837cc60644337e6f1ed02ea3048eaaab5e101d008834a96dcb8605a9f4&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508645918360998130/20241129_133623_071_saved.jpg?ex=6a1e3480&is=6a1ce300&hm=5b2f759a9f2f584e0bdea259170e4b2ffe3b9b5d7e1a58ce8a7f3fcda6ae8eeb&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640546011484210/20250901_074514.jpg?ex=6a1e2f7f&is=6a1cddff&hm=e4096ee1579e6a1195eac70c51fd10f84ef4e9e2298446bd5dfef79eb6046ab3&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640549433901136/20240803_102015.jpg?ex=6a1e2f80&is=6a1cde00&hm=548d0f253886596944bc5ffcac841add3b52ae54047e06fc956d4d6e53528fc8&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640550033821787/20250901_074639.jpg?ex=6a1e2f80&is=6a1cde00&hm=84209a95006a00a8df6af1935bd011ca7aa4b0e32d20d7f4d83ac8464d98c812&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640548142055504/IMG-20230726-WA0000.jpg?ex=6a1e2f7f&is=6a1cddff&hm=79a7e51ebb0d367d72117ff8d06a4b97280245aa69f4a13beb0a76644d2bd684&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640547739271328/IMG-20240327-WA0000.jpg?ex=6a1e2f7f&is=6a1cddff&hm=2b4e021b6e543674127ea3b69f4ac2ecaed5d4eeeb4385665c46507af205849d&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640548658090015/20240803_102039.jpg?ex=6a1e2f7f&is=6a1cddff&hm=1637c4007f9845cf1a0dae058b345ea22bd7348d199d64f108b1a9cb069f4beb&',
    'https://cdn.discordapp.com/attachments/1508630000088256723/1508640546464465067/20241129_133555.jpg?ex=6a1e2f7f&is=6a1cddff&hm=b8eb7b2c603f5be2bcc1879516e0b13e11cf57312260669a9072c021d375cbe6&'
]
const attachments = []

for (const url of urls) {
    attachments.push(new AttachmentBuilder(url))
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selfie')
        .setDescription('gives you a cute pic of bobi'),
    async execute(interaction) {
        const chosen = attachments[Math.floor(Math.random() * attachments.length)]
        interaction.reply({
            files: [chosen]
        })
    },
}