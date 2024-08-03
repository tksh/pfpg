import { normalizedToHex }   from 'color-formatter/normalized-to-hex'
import { hexShortenFromTen } from 'color-formatter/hex-shorten'
import { hexExpandToSix }    from 'color-formatter/hex-expand'


export function encodeGroupColors(){
    // Read the lines data from .json as Map()
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')

    const encodedStrByGroup = new Map();

    for (let linesData of linesDataMap.values()) {

        let colorsStr = ""

        // Normalize three color values
        const gStroke           = hexExpandToSix(linesData.g_stroke.slice(1)) // Remove '#'
        const gOpacity       = normalizedToHex(linesData.g_opacity)         // Number to Hex
        const gStrokeOpacity = normalizedToHex(linesData.g_stroke_opacity)  // Number to Hex

        // Merge
        colorsStr = gStroke + gOpacity + gStrokeOpacity
        console.log("colorsStr: ", colorsStr)

        // Shorten if could, 10 chars => 5 chars
        colorsStr = hexShortenFromTen(colorsStr)

        // Set into Map
        encodedStrByGroup.set(linesData.g_id, colorsStr)
    }
    return encodedStrByGroup
}
