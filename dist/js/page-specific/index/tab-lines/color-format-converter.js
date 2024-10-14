import { hexToRgb } from 'color-formatter/normalized-from-hex'
import { rgbToHex } from 'color-formatter/normalized-to-hex'
export
{ convertColorFormat, convertColorFormatForArray}
function convertColorFormat(color, colorFormat) {const currentFormat = detectColorFormat(color)
if (currentFormat === colorFormat) {return color} else {if (colorFormat === 'rgb') {return hexToRgb(color)} else {return rgbToHex(color)}}}
function convertColorFormatForArray(strokeArr, colorFormat) {return strokeArr.map(color => convertColorFormat(color, colorFormat))}
function detectColorFormat(colorString) {return colorString.startsWith('rgb') ? 'rgb' : 'hex'}