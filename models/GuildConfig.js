const mongoose = require('mongoose');
const config = require('../config.json');

// 1. Establish the absolute core fields every single server must have
const schemaDefinition = {
    guildId: { 
        type: String, 
        required: true, 
        unique: true 
    }
};

// 2. Loop through config.json and dynamically inject the server settings
for (const [key, data] of Object.entries(config)) {
    // Skip variables that shouldn't be saved as per-server options in the database
    if (key === 'developer_ids') continue;

    // Map your config's string type properties to native JavaScript constructors
    let nativeType;
    if (data.valueType === 'boolean') nativeType = Boolean;
    else if (data.valueType === 'number') nativeType = Number;
    else nativeType = String; // Default fallback

    // Inject the configuration key straight into our schema map structure
    schemaDefinition[key] = {
        type: nativeType,
        default: data.value // Use the current global value as the baseline default!
    };
}

// 3. Compile the dynamically created definition matrix into a standard Mongoose Schema
const DynamicGuildConfigSchema = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model('GuildConfig', DynamicGuildConfigSchema);