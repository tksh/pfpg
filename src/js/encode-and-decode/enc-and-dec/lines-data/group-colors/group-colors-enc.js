import { rgbObjToHex }       from 'color-formatter/normalized-to-hex'
import { uint8ToHex }        from 'color-formatter/normalized-to-hex'
import { hexShortenFromTen } from 'color-formatter/hex-shorten'
import { jsonToMapObj }      from 'encode/json-to-map-obj'


export function encodeGroupColors(){
    // Read the lines data from .json as Map()
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')

    const encodedStrByGroup = new Map()

    for (let linesData of linesDataMap.values()) {

        let colorsStr = ""

        // Normalize three color values
        // console.log(typeof(linesData.g_stroke)) // object
        const gStroke        = rgbObjToHex(linesData.g_stroke)         // Uint8 RGB object to hex
        const gOpacity       = uint8ToHex(linesData.g_opacity)         // Uint8 number to Hex
        const gStrokeOpacity = uint8ToHex(linesData.g_stroke_opacity)  // Uint8 number to Hex

        // Merge
        colorsStr = gStroke + gOpacity + gStrokeOpacity
        console.log("colorsStr: ", colorsStr)

        // Shorten if could, 10 chars => 6|5|3|1 chars
        colorsStr = hexShortenFromTen(colorsStr)

        // Set into Map
        encodedStrByGroup.set(linesData.g_id, colorsStr)
    }
    return encodedStrByGroup
}
