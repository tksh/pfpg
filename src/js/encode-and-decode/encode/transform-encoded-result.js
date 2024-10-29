import { ENCODING_METHOD_AND_CONFIG_MAP } from 'constants'


// For encoding methods except 'bruteforce53'

// Convert the structure of values
// from:
//     Key   : Group ID
//     Values: encoded string
// to:
//     Key   : Group ID
//     Values: [encoded string, method name, config object]

export function convertResultsFromStrToArray(encodedStrByGroups, encodingMethodName, encodingConfigValue) {
    // Get the configuration value name as key of object
    const configKey = ENCODING_METHOD_AND_CONFIG_MAP.get(encodingMethodName)

    return new Map(
        Array.from(encodedStrByGroups, ([key, value]) => [
            key, [value, encodingMethodName, { [configKey]: encodingConfigValue }]
        ])
    )
}