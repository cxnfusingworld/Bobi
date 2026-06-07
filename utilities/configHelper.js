const globalConfig = require('../config.json');
const GuildConfig = require('../models/GuildConfig.js');

/**
 * Dynamically fetches settings for a server, falling back to global defaults if needed.
 * @param {string} guildId - The Discord Server ID
 * @returns {Promise<Object>} An object containing all active settings for that guild
 */
async function getGuildSettings(guildId) {
    // If it's a DM or has no guildId, just return global defaults right away
    if (!guildId) {
        const fallbacks = {};
        for (const [key, data] of Object.entries(globalConfig)) {
            if (key !== 'developer_ids') fallbacks[key] = data.value;
        }
        return fallbacks;
    }

    // Try to find the server document in MongoDB Atlas
    const serverSettings = await GuildConfig.findOne({ guildId });

    const activeConfig = {};

    // Loop through your master json keys to construct the perfect layout
    for (const [key, data] of Object.entries(globalConfig)) {
        if (key === 'developer_ids') continue;

        // Use database value if it exists, otherwise use the global config baseline
        activeConfig[key] = (serverSettings && serverSettings[key] !== undefined) 
            ? serverSettings[key] 
            : data.value;
    }

    return activeConfig;
}

module.exports = { getGuildSettings };