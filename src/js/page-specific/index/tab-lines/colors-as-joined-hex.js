import { tryShortenAsHalf }     from "color-formatter/hex-shorten"
import { normalizedToHex }      from "color-formatter/normalized-to-hex"
import { tryDeleteFs }          from "color-formatter/try-delete-f"
import { convertColorFormatForArray
       , getGroupColorsValues } from "tab-lines/group-colors"

export function getGroupColorsAsJoinedHex(inputSvg) {

    // Lines group color attributes (stroke(st), opacity(op), stroke-opacity(so))
    // `stroke` will always be get as HEX format, even if RGB is current selected status.
    const groupColorsValues = getGroupColorsValues(inputSvg)
    const stArray = convertColorFormatForArray(groupColorsValues.get('stroke_array'), 'hex')
    const opArray = groupColorsValues.get('opacity_array')
    const soArray = groupColorsValues.get('stroke_opacity_array')
    console.log(stArray) // Type: String | e.g.: Array(5) [ "#97FF6E", "#000000", "#8ACAFF", "#eeeeee", "#ffffff" ]
    console.log(opArray) // Type: String | e.g.: Array(5) [ "0.5", "1", "1", "1", "1" ]
    console.log(soArray) // Type: String | e.g.: Array(5) [ "1", "0.8", "1", "1", "1" ]

    const stHexArray = stArray.map((colorValueStr) => colorValueStr.slice(1).toUpperCase()) // Delete '#'
    const opHexArray = opArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
    const soHexArray = soArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
    console.log(stHexArray) // 6 chars hex | e.g.: Array(5) [ "97FF6E", "000000", "8ACAFF", "EEEEEE", "FFFFFF" ]
    console.log(opHexArray) // 2 chars hex | e.g.: Array(5) [ "80", "FF", "FF", "FF", "FF" ]
    console.log(soHexArray) // 2 chars hex | e.g.: Array(5) [ "FF", "CC", "FF", "FF", "FF" ]

    // The formatting hex digits could be possible as 7 (3+2+2) or 10 (6+2+2)
    //   - 'stroke' (3|6) + 'opacity' (2) + 'stroke-opacity' (2)

    // join the values without any delimiters to form: [stroke][opacity][stroke-opacity]
    const mergedHexArray = stHexArray.map((item, index) => item + opHexArray[index] + soHexArray[index])

    // Reducing into half length if all hex pairs are duplicated.                  10 => 5
    // And deleting for "FF" (in 5 chars hex) or "FFFF" (in 10 chars hex) at last. 10 => 6, 5 => 3
    const compressedHexArray = mergedHexArray.map(tenCharsHex => tryDeleteFs(tryShortenAsHalf(tenCharsHex)))

    // Join the formatted each groups hex with underscore '_'
    return compressedHexArray.join('_')
}