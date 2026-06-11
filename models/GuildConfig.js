const mongoose = require('mongoose')
const config = require('../config.json')

const schemaDefinition = {
    guildId: { 
        type: String, 
        required: true, 
        unique: true 
    }
}

for (let [key, data] of Object.entries(config)) {
    if (key === 'developer_ids' || key === 'whitelisted_servers') continue

    let nativeType
    if (data.valueType === 'boolean') nativeType = Boolean
    else if (data.valueType === 'number') nativeType = Number
    else if (data.valueType === 'channel') {
        nativeType = String
        key = key+'_id'
    }
    else nativeType = String // Default fallback

    schemaDefinition[key] = {
        type: nativeType,
        default: data.value
    }
}

const DynamicGuildConfigSchema = new mongoose.Schema(schemaDefinition)

module.exports = mongoose.model('GuildConfig', DynamicGuildConfigSchema)