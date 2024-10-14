import { tryAddHash } from 'color-formatter/hex-expand'
import { tryDeleteHash } from 'color-formatter/hex-shorten'
export
{ normalizedToHex, uint8ToHex, rgbObjToHex, rgbStrToMap, rgbMapToSixDigitsHex, rgbToHex}
function normalizedToHex(num) {if (num < 0 || num > 1) {return "Invalid number"}
return Math.round(num * 255)
.toString(16)
.padStart(2, '0')
.toUpperCase()}
function uint8ToHex(num) {if (num < 0 || num > 255 || !Number.isInteger(num)) {return "Invalid number"}
return num
.toString(16)
.padStart(2, '0')
.toUpperCase()}
function rgbObjToHex(rgbDict) {const r = uint8ToHex(rgbDict.r)
const g = uint8ToHex(rgbDict.g)
const b = uint8ToHex(rgbDict.b)
return r + g + b}
function rgbStrToMap(rgbString) {const regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
const match = rgbString.match(regex)
if (!match) {return "Invalid RGB string format"}
const [, r, g, b] = match
return new Map([['r', parseInt(r)],['g', parseInt(g)],['b', parseInt(b)]])}
function rgbMapToSixDigitsHex(rgbMap) {const rgbTwoDigitsHexArr = [...rgbMap.values()].map(value => uint8ToHex(value))
return rgbTwoDigitsHexArr.join('')}
const rgbUint8Map = new Map([['r', 127],['g', 127],['b', 127]])
function rgbToHex(rgbStr) {const rgbMap = rgbStrToMap(tryDeleteHash(rgbStr))
const sixDigitsHex = rgbMapToSixDigitsHex(rgbMap)
return tryAddHash(sixDigitsHex)}