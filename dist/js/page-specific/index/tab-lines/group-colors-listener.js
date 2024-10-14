import { getSvgString } from 'download'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { getGroupColorsAsJoinedHex } from 'tab-lines/encode-colors-as-hex'
import { generateGroupColorsSvgTags } from 'tab-lines/group-colors'
import { getOpacity, getStroke, getStrokeOpacity, regexMatchesOfGroupColors} from 'tab-lines/get-colors-from-svg'
import { replaceAtIndex } from 'utils/replace-at-index'
export function addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, attrName) {for (let i = 0; i < numberOfGroups; i++) {const elementId = `group-colors-${attrName}-${i}`
const element = document.querySelector(`#${elementId}`)
element.addEventListener('change', function (event) {const inputValue = event.target.value
const gId = elementId.replace(`group-colors-${attrName}-`, '')
const svgString = getSvgString()
const matches = regexMatchesOfGroupColors(svgString)
const stroke = getStroke(matches[i])
const opacity = getOpacity(matches[i])
const strokeOpacity = getStrokeOpacity(matches[i])
let groupColorsArr = []
if (attrName === 'stroke') {groupColorsArr = [undefined,inputValue,opacity,strokeOpacity]} else if (attrName === 'opacity') {groupColorsArr = [undefined,stroke,inputValue,strokeOpacity]} else if (attrName === 'stroke-opacity') {groupColorsArr = [undefined,stroke,opacity,inputValue]}
const changedGroupElem = generateGroupColorsSvgTags(groupColorsArr)
const pattern = /<g stroke=[^>]*>/g
const updatedSvg = replaceAtIndex(svgString, pattern, changedGroupElem, gId)
document.querySelector('#svg-string').value = updatedSvg
const groupColorsHexString = getGroupColorsAsJoinedHex(updatedSvg)
updateState('groupColors', groupColorsHexString)
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}}