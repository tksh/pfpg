import { getSvgString } from 'button/download-as-file'
import { convertColorFormat } from 'tab-lines/color-format-converter'
import { generateGroupColorsSvgTags } from 'tab-lines/group-colors-generator'
import { getElementValueById } from 'tab-lines/opacity-steps'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
import { replaceAtIndex } from 'utils/replace-at-index'
export function updateSvgAsNewColorFormat(colorFormat) {let inputSvg = getSvgString()
const numberOfGroups = getNumberOfGroups(inputSvg)
const processGroup = (inputSvg, gId) => {const strokeElementId = `group-colors-stroke-${gId}`
const stroke = convertColorFormat(getElementValueById(strokeElementId), colorFormat)
const opacityElementId = `group-colors-opacity-${gId}`
const opacity = getElementValueById(opacityElementId)
const strokeOpacityElementId = `group-colors-stroke-opacity-${gId}`
const strokeOpacity = getElementValueById(strokeOpacityElementId)
const groupColorsArr = [undefined,stroke,opacity,strokeOpacity]
const changedGroupElem = generateGroupColorsSvgTags(groupColorsArr)
const pattern = /<g stroke=[^>]*>/g
return replaceAtIndex(inputSvg, pattern, changedGroupElem, gId)}
const updatedSvg = Array.from({ length: numberOfGroups }, (_, gId) => gId)
.reduce((acc, gId) => processGroup(acc, gId), inputSvg)
return updatedSvg}