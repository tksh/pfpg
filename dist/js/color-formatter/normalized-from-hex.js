import { hexExpandToSix } from 'color-formatter/hex-expand'
import { tryDeleteHash } from 'color-formatter/hex-shorten'
export
{ normalizedFromHex, hexToUint8, hexToRgbMap, hexToRgb}
function normalizedFromHex(hex) {const decimalValue = parseInt(hex, 16)
const normalizedValue = decimalValue / 255
const normalizedValueFixed = Number(normalizedValue.toFixed(2))
return normalizedValueFixed}
function hexToUint8(twoDigitsHex) {if (!/^[0-9A-Fa-f]{2}$/.test(twoDigitsHex)) {return "Invalid hex string"}
const num = parseInt(twoDigitsHex, 16)
return num}
function hexToRgbMap(threeOrSixDigitsHex) {const hexWithoutHash = tryDeleteHash(threeOrSixDigitsHex)
const sixDigitsHex = hexExpandToSix(hexWithoutHash)
if (!/^[0-9A-Fa-f]{6}$/.test(sixDigitsHex)) {return "Invalid hex string"}
const r = sixDigitsHex.substring(0, 2)
const g = sixDigitsHex.substring(2, 4)
const b = sixDigitsHex.substring(4, 6)
return new Map([['r', hexToUint8(r)],['g', hexToUint8(g)],['b', hexToUint8(b)]])}
function hexToRgb(hexStr) {const rgbMap = hexToRgbMap(tryDeleteHash(hexStr))
return `rgb(${[...rgbMap.values()].join(',')})`}