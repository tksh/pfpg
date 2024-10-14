import { getState } from 'state/url-state-manager'
import { generateGroupColorsHtmlElements, generateGroupColorsSvgTags} from 'tab-lines/group-colors'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
import { replaceAtIndex } from 'utils/replace-at-index'
export function applyGroupColors(svgString, resvgOption, groupColorsByGroups, opacitySteps) {const colorFormat = getState('colorFormat')
const gElemByGroups = groupColorsByGroups.map(groupColorsArr => generateGroupColorsSvgTags(groupColorsArr))
const pattern = /<g stroke=[^>]*>/g
let updatedSvg = svgString
gElemByGroups.forEach((gElem, gId) => {updatedSvg = replaceAtIndex(updatedSvg, pattern, gElem, gId)})
generateGroupColorsHtmlElements(updatedSvg, colorFormat, opacitySteps)
const numberOfGroups = getNumberOfGroups(svgString)
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')
return updatedSvg}