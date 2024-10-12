import { hexExpandToTen }     from 'color-formatter/hex-expand'
import { hexShortenAsHalf }   from 'color-formatter/hex-shorten'
import { normalizedFromHex }  from 'color-formatter/normalized-from-hex'
import { convertColorFormat } from 'tab-lines/color-format-converter'

export
    { decodeGroupColorsAsArray
    , getGroupOpacitiesAsMap
    }


// Decode the group colors value
// -  input: Hex string that has joined whole groups with '_'
// - output: Array contains each group arrays that structured same as regex '.match()' method returns.

function decodeGroupColorsAsArray(joinedHex, colorFormat) {

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


// Decode the group colors value
// -  input: Array contains each group arrays that structured same as regex '.match()' method returns.
// - output: Map that structured like as 'decodeAsThreeData(urlSearchParams)' function returns.
//           Nested objects stored as value under the map object using group ID key

function getGroupOpacitiesAsMap(groupColorsArray) {
    // console.log("groupColorsArray: ", groupColorsArray)
    // e.g.: (3) [Array(4), Array(4), Array(4)]
    //         0: (4) [undefined, 'rgb(56,170,100)', 0.6, 0.4]
    //         1: (4) [undefined, 'rgb(0,0,0)', 1, 1]
    //         2: (4) [undefined, 'rgb(255,255,255)', 1, 1]

    const opacitiesArrays = groupColorsArray.map(arr => [arr[2], arr[3]])
    const opacitiesByGroupMap = new Map()

    for (const [index, opacities] of opacitiesArrays.entries()) {
        opacitiesByGroupMap.set(
            `${index}`,                           // group ID: uint as string: '0', '1', ...
            {
                groupColors: {
                    gOpacity: opacities[0],       //        opacity value: float[0.0-1.0] as string
                    gStrokeOpacity: opacities[1]  // stroke-opacity value: float[0.0-1.0] as string
                }
            }
        )
    }
    // console.log("opacitiesByGroupMap: ", opacitiesByGroupMap)
    // e.g.: Map(3) {'0' => {…}, '1' => {…}, '2' => {…}}
    return opacitiesByGroupMap
}
