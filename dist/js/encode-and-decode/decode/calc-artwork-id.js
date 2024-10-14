import { bech32, bech32m} from 'libs/bech32-and-bech32m'
export async function calculateArtworkId(linesData) {const calcArtworkIdStartTime = performance.now()
const compositeSequence = generateCompositeSequence(linesData)
const { hexHash, bech32Hash, bech32mHash } = await sha256ThenBech32(compositeSequence)
const calcArtworkIdEndTime = performance.now()
const elapsedTime = Math.floor(calcArtworkIdEndTime - calcArtworkIdStartTime)
return { hexHash, bech32Hash, bech32mHash }}
function generateCompositeSequence(linesData) {return Array.from(linesData).map(([key, value]) => createGroupSequence(key, value)).join('_')}
function createGroupSequence(key, value) {const { gIdVal, gIdDig } = getSequenceOfGroupId(key)
const { colorsVal, colorsDig } = getSequenceOfColors(value.groupColors)
const { strokeWidthVal, strokeWidthDig } = getSequenceOfStrokeWidth(value.widthsAndCounts)
const { absDvalsVal, absDvalsDig } = getSequenceOfAbsDvals(value.absDvalsObj)
const valuesSequence = gIdVal + colorsVal + strokeWidthVal + '_' + absDvalsVal
const digitsSequence = gIdDig + colorsDig + strokeWidthDig + '_' + absDvalsDig
return valuesSequence + '_' + digitsSequence}
function getDigits(number) {return number.toString().length}
function getSequenceOfGroupId(groupId) {const gIdVal = groupId.toString()
const gIdDig = getDigits(groupId)
return { gIdVal, gIdDig }}
function getSequenceOfColors(groupColors) {const gStroke = [...groupColors.gStrokeRgbMap.values()].join('')
const gOpacity = groupColors.gOpacityUint8.toString()
const gStrokeOpacity = groupColors.gStrokeOpacityUint8.toString()
const colorsVal = gStroke + gOpacity + gStrokeOpacity
const gStrokeDig = [...groupColors.gStrokeRgbMap.values()].map(value => getDigits(value)).join('')
const gOpacityDig = getDigits(gOpacity)
const gStrokeOpacityDig = getDigits(gStrokeOpacity)
const colorsDig = gStrokeDig + gOpacityDig + gStrokeOpacityDig
return { colorsVal, colorsDig }}
function getSequenceOfStrokeWidth(widthsAndCounts) {const widths = [...widthsAndCounts.widths.values()].join('')
const counts = [...widthsAndCounts.counts.values()].join('')
const widthsDig = [...widthsAndCounts.widths.values()].map(value => getDigits(value)).join('')
const countsDig = [...widthsAndCounts.counts.values()].map(value => getDigits(value)).join('')
const strokeWidthVal = widths + counts
const strokeWidthDig = widthsDig + countsDig
return { strokeWidthVal, strokeWidthDig }}
function getSequenceOfAbsDvals(absDvalsObj) {const absDValX1 = [...absDvalsObj.x1.values()].join('')
const absDValY1 = [...absDvalsObj.y1.values()].join('')
const absDValX2 = [...absDvalsObj.x2.values()].join('')
const absDValY2 = [...absDvalsObj.y2.values()].join('')
const absDvalsVal = absDValX1 + absDValY1 + absDValX2 + absDValY2
const absDValDigitsX1 = [...absDvalsObj.x1.values()].map(value => getDigits(value)).join('')
const absDValDigitsY1 = [...absDvalsObj.y1.values()].map(value => getDigits(value)).join('')
const absDValDigitsX2 = [...absDvalsObj.x2.values()].map(value => getDigits(value)).join('')
const absDValDigitsY2 = [...absDvalsObj.y2.values()].map(value => getDigits(value)).join('')
const absDvalsDig = absDValDigitsX1 + absDValDigitsY1 + absDValDigitsX2 + absDValDigitsY2
return { absDvalsVal, absDvalsDig }}
async function sha256ThenBech32(inputStr, hrp = 'uinp') {const encoder = new TextEncoder()
const utf8 = encoder.encode(inputStr)
const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
const hashArray = Array.from(new Uint8Array(hashBuffer))
const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
const words = bech32.toWords(hashArray)
const bech32Hash = bech32.encode(hrp, words)
const bech32mHash = bech32m.encode(hrp, words)
return { hexHash, bech32Hash, bech32mHash }}