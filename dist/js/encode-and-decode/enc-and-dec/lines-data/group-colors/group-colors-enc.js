import { rgbObjToHex } from 'color-formatter/normalized-to-hex'
import { uint8ToHex } from 'color-formatter/normalized-to-hex'
import { hexShortenFromTen } from 'color-formatter/hex-shorten'
import { jsonToMapObj } from 'encode/json-to-map-obj'
export function encodeGroupColors(){const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
const encodedStrByGroups = new Map()
for (let linesData of linesDataMap.values()) {let colorsStr = ""
const gStroke = rgbObjToHex(linesData.g_stroke)
const gOpacity = uint8ToHex(linesData.g_opacity)
const gStrokeOpacity = uint8ToHex(linesData.g_stroke_opacity)
colorsStr = gStroke + gOpacity + gStrokeOpacity
colorsStr = hexShortenFromTen(colorsStr)
encodedStrByGroups.set(linesData.g_id, colorsStr)}
return encodedStrByGroups}