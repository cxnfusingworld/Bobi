const mongoose = require('mongoose')
const config = require('../config.json')

const ignoreKeys = ['developer_ids', 'whitelisted_servers']

const schemaDefinition = {
    guildId: { 
        type: String, 
        required: true, 
        unique: true 
    }
}

for (let [key, data] of Object.entries(config)) {
    if (ignoreKeys.includes(key)) continue

    let nativeType
    if (data.valueType === 'boolean') nativeType = Boolean
    else if (data.valueType === 'number') nativeType = Number
    else if (data.valueType === 'channel' || data.valueType === 'role') {
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