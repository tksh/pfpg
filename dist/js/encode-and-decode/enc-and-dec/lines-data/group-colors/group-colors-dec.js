import { normalizedFromHex, hexToRgbMap, hexToUint8} from 'color-formatter/normalized-from-hex'
import { addDecimalToZeroAndOne } from 'common-utils/format-as-float'
export function decodeGroupColors(tenDigitsHex) {const gStrokeHex = '#' + tenDigitsHex.slice(0, 6)
const gStrokeRgbMap = hexToRgbMap(gStrokeHex)
const gStrokeRgbStr = `rgb(${[...gStrokeRgbMap.values()].join(',')})`
const gOpacityUint8 = hexToUint8(tenDigitsHex.slice(6, 8))
const gOpacityFloat = normalizedFromHex(tenDigitsHex.slice(6, 8))
const gOpacity = addDecimalToZeroAndOne(gOpacityFloat)
const gStrokeOpacityUint8 = hexToUint8(tenDigitsHex.slice(8))
const gStrokeOpacityFloat = normalizedFromHex(tenDigitsHex.slice(8))
const gStrokeOpacity = addDecimalToZeroAndOne(gStrokeOpacityFloat)
return {gStrokeHex,gStrokeRgbMap,gStrokeRgbStr,gOpacityUint8,gOpacityFloat,gOpacity,gStrokeOpacityUint8,gStrokeOpacityFloat,gStrokeOpacity}}