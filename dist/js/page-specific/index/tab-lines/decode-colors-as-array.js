import { hexExpandToTen } from 'color-formatter/hex-expand'
import { hexShortenAsHalf } from 'color-formatter/hex-shorten'
import { normalizedFromHex } from 'color-formatter/normalized-from-hex'
import { convertColorFormat } from 'tab-lines/color-format-converter'
export
{ decodeGroupColorsAsArray, getGroupOpacitiesAsMap}
function decodeGroupColorsAsArray(joinedHex, colorFormat) {const hexByGroups = joinedHex.split('_')
return hexByGroups.map((hex) => {const tenDigitsHex = hexExpandToTen(hex)
const strokeAsHex = '#' + hexShortenAsHalf(tenDigitsHex.slice(0, 6))
const stroke = convertColorFormat(strokeAsHex, colorFormat)
const opacity = normalizedFromHex(tenDigitsHex.slice(6, 8))
const strokeOpacity = normalizedFromHex(tenDigitsHex.slice(8))
return [undefined, stroke, opacity, strokeOpacity]})}
function getGroupOpacitiesAsMap(groupColorsArray) {const opacitiesArrays = groupColorsArray.map(arr => [arr[2], arr[3]])
const opacitiesByGroupMap = new Map()
for (const [index, opacities] of opacitiesArrays.entries()) {opacitiesByGroupMap.set(`${index}`,{groupColors: {gOpacity: opacities[0],gStrokeOpacity: opacities[1]}})}
return opacitiesByGroupMap}