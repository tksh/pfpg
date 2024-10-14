import { hexShortenAsHalf } from 'color-formatter/hex-shorten'
import { normalizedToHex } from 'color-formatter/normalized-to-hex'
import { tryDeleteFs } from 'color-formatter/try-delete-f'
import { convertColorFormatForArray } from 'tab-lines/color-format-converter'
import { getGroupColorsValues } from 'tab-lines/get-colors-from-svg'
export function getGroupColorsAsJoinedHex(inputSvg) {const groupColorsValues = getGroupColorsValues(inputSvg)
const stArray = convertColorFormatForArray(groupColorsValues.get('stroke_array'), 'hex')
const opArray = groupColorsValues.get('opacity_array')
const soArray = groupColorsValues.get('stroke_opacity_array')
const stHexArray = stArray.map((colorValueStr) => colorValueStr.slice(1).toUpperCase())
const opHexArray = opArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
const soHexArray = soArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
const mergedHexArray = stHexArray.map((item, index) => item + opHexArray[index] + soHexArray[index])
const compressedHexArray = mergedHexArray.map(tenCharsHex => tryDeleteFs(hexShortenAsHalf(tenCharsHex)))
return compressedHexArray.join('_')}