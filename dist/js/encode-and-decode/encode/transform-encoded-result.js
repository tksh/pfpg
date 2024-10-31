import { ENCODING_METHOD_AND_CONFIG_MAP } from 'constants'
export function convertResultsFromStrToArray(encodedStrByGroups, encodingMethodName, encodingConfigValue) {const configKey = ENCODING_METHOD_AND_CONFIG_MAP.get(encodingMethodName)
return new Map(Array.from(encodedStrByGroups, ([key, value]) => [key, [value, encodingMethodName, { [configKey]: encodingConfigValue }]]))}