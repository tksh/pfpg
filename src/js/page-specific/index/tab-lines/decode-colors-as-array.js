import { hexExpandToTen } from 'color-formatter/hex-expand'
import { hexShortenAsHalf } from "color-formatter/hex-shorten"
import { normalizedFromHex } from 'color-formatter/normalized-from-hex'
import { convertColorFormat } from 'tab-lines/group-colors'


//    const groupColorsByGroups = decodeGroupColors(value)
// Decode the group colors value
// - from: Hex string that has joined whole groups with '_'
// -   to: Array structured same as regex '.match()' method returns.
// - Type: Array of arrays

export function decodeGroupColorsAsArray(joinedHex, colorFormat) {

    const hexByGroups = joinedHex.split('_')
    return hexByGroups.map((hex) => {
        // Decode
        const tenDigitsHex = hexExpandToTen(hex)
        const strokeAsHex   = '#' + hexShortenAsHalf(tenDigitsHex.slice(0, 6))  // 6 digits hex => Reduce to 3 digits if could
        const stroke        = convertColorFormat(strokeAsHex, colorFormat)      // Convert to RGB if it's currently selected, otherwise return as-is
        const opacity       = normalizedFromHex(tenDigitsHex.slice(6, 8))       // 2 digits hex => Float [0-1]
        const strokeOpacity = normalizedFromHex(tenDigitsHex.slice(8))          // 2 digits hex => Float [0-1]

        // Generate the array as same structured like regex '.match()' object
        return [undefined, stroke, opacity, strokeOpacity]
    })
}

export function getGroupOpacitiesAsMap(groupColorsArray) {
    const opacitiesArrays = groupColorsArray.map(arr => [arr[2], arr[3]])
    const opacitiesByGroupMap = new Map()

    for (const [index, opacities] of opacitiesArrays.entries()) {
        opacitiesByGroupMap.set(
            `${index}`,                             // group ID: uint as string: '0', '1', ...
            {
                groupColors: {
                    gOpacity: opacities[0],              //        opacity value: float[0.0-1.0] as string
                    gStrokeOpacity: opacities[1]         // stroke-opacity value: float[0.0-1.0] as string
                }
            }
        )
    }
    console.log("opacitiesByGroupMap: ", opacitiesByGroupMap)
    return opacitiesByGroupMap
}
