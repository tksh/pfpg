import { normalizedToHex } from 'color-formatter/normalized-to-hex'
export
{ hexExpandToTen, hexExpandToEight, hexExpandToSix, tryAddHash}
function hexExpandToTen(hex) {if (hex.length === 10) {return hex} else if (hex.length === 6) {return hex + 'ffff'}
else if (hex.length === 3 || hex.length === 5) {let chars = hex.split("")
let expanded = chars.map(char => char.repeat(2)).join("")
if (expanded.length === 6) {return expanded + 'ffff'} else {return expanded}}
else if (hex.length === 1) {return hex.repeat(6) + 'ffff'}
else {return new Error("Invalid hex code")}}
function hexExpandToEight(hexWithHash, opacity) {let hex = hexWithHash.slice(1)
hex = hexExpandToSix(hex)
const opacityAsHex = normalizedToHex(opacity)
return hex + opacityAsHex}
function hexExpandToSix(hex) {if (!hex) {return undefined}
if (hex.length === 6) {return hex} else if (hex.length === 3) {let chars = hex.split("")
let expanded = chars.map(char => char.repeat(2)).join("")
return expanded} else {return new Error("Invalid hex code")}}
function tryAddHash(hexString) {if (!hexString.startsWith('#')) {return '#' + hexString}
return hexString}