import { encodingMethodAndConfig } from 'constants'
export function convertResultsFromStrToArray(encodedStrByGroups, encodingMethodName, encodingConfigValue) {const configKey = encodingMethodAndConfig.get(encodingMethodName)
return new Map(Array.from(encodedStrByGroups, ([key, value]) => [key, [value, encodingMethodName, { [configKey]: encodingConfigValue }]]))}