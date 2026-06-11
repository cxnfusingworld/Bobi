const { SlashCommandBuilder, InteractionContextType } = require('discord.js')

const snippets = {
    luau: '```lua\nprint("Hello World!")\n```',
    js: '```javascript\nconsole.log("Hello World!");\n```',
    python: '```python\nprint("Hello World!")\n```',
    c: '```c\n#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}\n```',
    cpp: '```cpp\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World!\\n";\n    return 0;\n}\n```',
    csharp: '```csharp\nConsole.WriteLine("Hello, World!");\n```',
    java: '```java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}\n```',
    kotlin: '```kotlin\nfun main() {\n    println("Hello World!")\n}\n```',
    swift: '```swift\nprint("Hello World!")\n```',
    go: '```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World!")\n}\n```',
    rust: '```rust\nfn main() {\n    println!("Hello World!");\n}\n```',
    php: '```php\n<?php\necho "Hello World!";\n?>\n```',
    ruby: '```ruby\nputs "Hello World!"\n```',
    perl: '```perl\nprint "Hello World!\\n";\n```',
    r: '```r\ncat("Hello World!\\n")\n```',
    matlab: '```matlab\ndisp("Hello World!")\n```',
    dart: '```dart\nvoid main() {\n  print("Hello World!");\n}\n```',
    scala: '```scala\nobject Main extends App {\n  println("Hello World!")\n}\n```',
    bash: '```bash\necho "Hello World!"\n```',
    powershell: '```powershell\nWrite-Host "Hello World!"\n```',
    sql: '```sql\nSELECT \'Hello World!\';\n```',
    html: '```html\n<!DOCTYPE html>\n<html>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>\n```',
    asm: '```x86asm\nsection .data\nmsg db "Hello World!",0x0A\nlen equ $-msg\n\nsection .text\nglobal _start\n_start:\n    mov edx,len\n    mov ecx,msg\n    mov ebx,1\n    mov eax,4\n    int 0x80\n    mov eax,1\n    int 0x80\n```',
    cat: '```\nmeow meow, meow mreow\n.. mew```'
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello-world')
        .setDescription('Gives you basic code for printing "Hello World!"')
        .addStringOption(option =>
            option.setName("language")
                .setDescription('Code language to print "Hello World!" in')
                .addChoices(
                    { name: 'Lua/Luau', value: 'luau' },
                    { name: 'JavaScript/TypeScript', value: 'js' },
                    { name: 'Python', value: 'python' },
                    { name: 'C', value: 'c' },
                    { name: 'C++', value: 'cpp' },
                    { name: 'C#', value: 'csharp' },
                    { name: 'Java', value: 'java' },
                    { name: 'Kotlin', value: 'kotlin' },
                    { name: 'Swift', value: 'swift' },
                    { name: 'Go', value: 'go' },
                    { name: 'Rust', value: 'rust' },
                    { name: 'PHP', value: 'php' },
                    { name: 'Ruby', value: 'ruby' },
                    { name: 'Perl', value: 'perl' },
                    { name: 'R', value: 'r' },
                    { name: 'MATLAB', value: 'matlab' },
                    { name: 'Dart', value: 'dart' },
                    { name: 'Scala', value: 'scala' },
                    { name: 'Bash', value: 'bash' },
                    { name: 'PowerShell', value: 'powershell' },
                    { name: 'SQL', value: 'sql' },
                    { name: 'HTML/CSS', value: 'html' },
                    { name: 'Assembly (x86)', value: 'asm' },
                    { name: 'Cat', value: 'cat' },
                )
        )
        .setContexts([
            InteractionContextType.Guild,
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction) {
        const language = interaction.options.getString("language") || "luau"
        const final = snippets[language] || snippets.luau

        await interaction.reply({
            content: final,
        })
    },
}