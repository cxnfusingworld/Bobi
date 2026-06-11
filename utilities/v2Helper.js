const { 
    ContainerBuilder, 
    SectionBuilder, 
    TextDisplayBuilder, 
    MediaGalleryBuilder, 
    MediaGalleryItemBuilder,
    SeparatorBuilder,
    ButtonBuilder,
    MessageFlags,
    AttachmentBuilder,
    Colors
} = require('discord.js')

class ComponentBuilder {
    constructor() {
        this.container = new ContainerBuilder()
        this.files = []
        this.flags = [MessageFlags.IsComponentsV2]
        this.allowedMentions = {}
    }

    // Set side accent color
    setColor(color) {
        this.container.setAccentColor(color || Colors.Blurple)
        return this
    }

    // Add normal, header, or subtext Markdown text blocks
    addText(markdownContent) {
        this.container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(markdownContent)
        )
        return this
    }

    // A modern row item: text on the left, an interactive button on the right
    addSectionRow(text, buttonLabel, customIdOrUrl, style) {
        const section = new SectionBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(text)
        )

        const btn = new ButtonBuilder().setLabel(buttonLabel)

        // If it looks like a web link, treat it as a URL link button
        if (customIdOrUrl.startsWith('http')) {
            btn.setURL(customIdOrUrl).setStyle(5) // Link style
        } else {
            btn.setCustomId(customIdOrUrl).setStyle(style || 1) // Interactive button
        }

        section.setButtonAccessory(btn)
        this.container.addSectionComponents(section)
        return this
    }

    // Easily drop a full banner image or multi-grid media gallery
    addImages(imagesArray) {
        const gallery = new MediaGalleryBuilder();
        
        imagesArray.forEach(img => {
            const item = new MediaGalleryItemBuilder();
            
            if (img instanceof AttachmentBuilder) {
                item.setURL(`attachment://${img.name}`);
                this.files.push(img);
            } else {
                item.setURL(img);
            }
            
            gallery.addItems(item);
        });

        this.container.addMediaGalleryComponents(gallery);
        return this;
    }

    // Create a horizontal divider line with customizable space sizes
    addDivider(spacingSize = 'Small') {
        this.container.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true).setSpacing(spacingSize)
        )
        return this
    }
    
    // Set ephemeral
    setEphemeral() {
        this.flags.push(MessageFlags.Ephemeral)
        return this
    }

    // Adds a flag
    addFlag(flag) {
        this.flags.push(flag)
        return this
    }

    // Turns off pings from the message
    setNoPing() {
        this.allowedMentions = { parse: [] }
        return this
    }

    build() {
        return {
            components: [this.container],
            files: this.files,
            flags: this.flags,
            allowedMentions: this.allowedMentions,
        }
    }
}

module.exports = ComponentBuilder