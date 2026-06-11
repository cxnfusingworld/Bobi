const globalConfig = require('../config.json');
const GuildConfig = require('../models/GuildConfig.js');

/**
 * Dynamically fetches settings for a server, falling back to global defaults if needed.
 * @param {string} guildId - The Discord Server ID
 * @returns {Promise<Object>} An object containing all active settings for that guild
 */
async function getGuildSettings(guildId) {
    if (!guildId) {
        const fallbacks = {};
        for (const [key, data] of Object.entries(globalConfig)) {
            if (key !== 'developer_ids') fallbacks[key] = data.value;
        }
        return fallbacks;
    }

    const serverSettings = await GuildConfig.findOne({ guildId });

    const activeConfig = {};

    for (let [key, data] of Object.entries(globalConfig)) {
        if (key === 'developer_ids' || key === 'whitelisted_servers') continue

        if (data.valueType === 'channel') key = key+'_id'

        activeConfig[key] = (serverSettings && serverSettings[key] !== undefined) 
            ? serverSettings[key] 
            : data.value;
    }

    return activeConfig;
}

module.exports = { getGuildSettings };