export
{ getGroupColorsValues, getOpacity, getStroke, getStrokeHex, getStrokeOpacity, getStrokeRgb, regexMatchesOfGroupColors}
function getGroupColorsValues(svgString) {const matches = regexMatchesOfGroupColors(svgString)
const numberOfGroups = matches.length
let strokeArray = []
let opacityArray = []
let strokeOpacityArray = []
for (let i = 0; i < matches.length; i++) {const stroke = getStroke(matches[i])
const opacity = getOpacity(matches[i])
const strokeOpacity = getStrokeOpacity(matches[i])
strokeArray.push(stroke)
opacityArray.push(opacity)
strokeOpacityArray.push(strokeOpacity)}
return new Map([['number_of_groups', numberOfGroups],['stroke_array', strokeArray],['opacity_array', opacityArray],['stroke_opacity_array', strokeOpacityArray]])}
function regexMatchesOfGroupColors(inputSvg) {const pattern = /<g stroke=[^>]*>/g
const matches = inputSvg.match(pattern)
return matches}
function getStroke(inputStr) {const strokeRgb = getStrokeRgb(inputStr)
const strokeHex = getStrokeHex(inputStr)
return strokeRgb??strokeHex}
function getStrokeHex(inputStr) {const pattern = /(#.*?)"/
const matches = inputStr.match(pattern)
return matches?.[1]}
function getStrokeRgb(inputStr) {const pattern = /(rgb\(.*?\))/
const matches = inputStr.match(pattern)
return matches?.[1]}
function getOpacity(inputStr) {const pattern = /\sopacity="([^"]*)"/
const matches = inputStr.match(pattern)
return matches === null ? '1.0' : matches[1]}
function getStrokeOpacity(inputStr) {const pattern = /stroke-opacity="([^"]*)"/
const matches = inputStr.match(pattern)
return matches === null ? '1.0' : matches[1]}