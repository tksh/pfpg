import { SETTINGS_DEFAULTS } from 'constants'
import { countSvgSize } from 'download'
import { getInitialOpacitySteps, calculateStepsFromTwoOpacities } from 'init/initial-opacity-steps'
import { tryRemoveOpacity, tryRemoveLineBreaks, tryRemoveSpaces } from 'modal/optimize-svg'
import { getState, updateState, getStateUrl } from 'state/url-state-manager'
import { applyGroupColors } from 'tab-lines/apply-group-colors'
import { decodeGroupColorsAsArray, getGroupOpacitiesAsMap } from 'tab-lines/decode-colors-as-array'
import { generateGroupColorsHtmlElements } from 'tab-lines/group-colors'
import { changeOpacitySelectOptionsAsNewStep, updateSvgForNewStep } from 'tab-lines/opacity-steps'
import { toggleDisplay, updateSvgWithSelectedShapePath } from 'tab-canvas/shape-to-trim'
import { replaceShapeRendering } from 'tab-render/shape-rendering'
import { toggleCheckerboardBg } from 'tab-ui/checkerboard-bg'
import { toggleTextWrapping } from 'tab-ui/text-wrapping'
import { changeThemeColor, getDefaultThemeViaPrefersColorScheme } from 'tab-ui/theme-color'
import { switchViewScaling } from 'tab-ui/view-scaling'
export
{ applyImageCustomization, applyUiConfiguration, applySvgOptimization}
function applyImageCustomization(svgString, resvgOption) {let updatedSvg = svgString
const colorFormat = getState('colorFormat')
document.getElementById("color-format").value = colorFormat
let opacitySteps = getInitialOpacitySteps()
SETTINGS_DEFAULTS.set('opacitySteps', opacitySteps)
const opacityStepsSelector = document.getElementById("opacity-steps")
opacityStepsSelector.value = opacitySteps
generateGroupColorsHtmlElements(svgString, colorFormat, opacitySteps)
const groupColors = getState('groupColors')
if (groupColors) {const groupColorsByGroupsArr = decodeGroupColorsAsArray(groupColors, colorFormat)
updatedSvg = applyGroupColors(svgString, resvgOption, groupColorsByGroupsArr, opacitySteps)
const opacitiesByGroupMap = getGroupOpacitiesAsMap(groupColorsByGroupsArr)
opacitySteps = calculateStepsFromTwoOpacities(opacitiesByGroupMap)}
const opacityStepsViaUrl = getStateUrl('opacitySteps')
if (opacityStepsViaUrl) {opacityStepsSelector.value = opacityStepsViaUrl
changeOpacitySelectOptionsAsNewStep(updatedSvg, opacityStepsViaUrl)
updatedSvg = updateSvgForNewStep(updatedSvg)}
const shapeToTrim = getState('shapeToTrim')
updatedSvg = updateSvgWithSelectedShapePath(shapeToTrim, updatedSvg)
const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']
if (shapeToTrim === 'squircleSlimmed') {toggleDisplay(elementsToToggle, 'inline')} else {toggleDisplay(elementsToToggle, 'none')}
const shapeRendering = getState('shapeRendering')
document.getElementById("shape-rendering").value = shapeRendering
updatedSvg = replaceShapeRendering(updatedSvg, shapeRendering)
const widthPixelSize = parseInt(getState('widthPixelSize'), 10)
resvgOption.fitTo.value = widthPixelSize
document.querySelector('#png-size-number').value = widthPixelSize
document.querySelector('#png-size-range').value = widthPixelSize
return updatedSvg}
function applyUiConfiguration() {const viewScaling = getState('viewScaling')
document.getElementById('view-scaling').value = viewScaling
switchViewScaling(viewScaling)
const isCheckerboardBg = getState('checkerboardBg')
document.getElementById('checkerboard-bg').checked = isCheckerboardBg
toggleCheckerboardBg(isCheckerboardBg)
const isTextWrapping = getState('textWrapping')
document.getElementById('text-wrapping').checked = isTextWrapping
toggleTextWrapping(isTextWrapping)
const themeColor = getStateUrl('themeColor') ? getStateUrl('themeColor') : getDefaultThemeViaPrefersColorScheme()
updateState('themeColor', themeColor)
document.getElementById('theme-color').value = themeColor
changeThemeColor(themeColor)}
function applySvgOptimization(svgString) {const isOpacityRemoved = getState('removeOpacity')
updateState('removeOpacity', isOpacityRemoved)
const removeOpacityApplied = tryRemoveOpacity(svgString, isOpacityRemoved)
document.getElementById('remove-opacity').checked = isOpacityRemoved
document.querySelector('#before-remove-opacity').classList.toggle('option-applied', !isOpacityRemoved)
document.querySelector('#after-remove-opacity').classList.toggle('option-applied', isOpacityRemoved)
const isLineBreaksRemoved = getState('removeLineBreaks')
updateState('removeLineBreaks', isLineBreaksRemoved)
const removeLineBreaksApplied = tryRemoveLineBreaks(removeOpacityApplied, isLineBreaksRemoved)
document.getElementById('remove-line-breaks').checked = isLineBreaksRemoved
document.querySelector('#before-remove-line-breaks').classList.toggle('option-applied', !isLineBreaksRemoved)
document.querySelector('#after-remove-line-breaks').classList.toggle('option-applied', isLineBreaksRemoved)
const isSpacesRemoved = getState('removeSpaces')
updateState('removeSpaces', isSpacesRemoved)
const removeSpacesApplied = tryRemoveSpaces(removeLineBreaksApplied, isSpacesRemoved)
document.getElementById('remove-spaces').checked = isSpacesRemoved
document.querySelector('#before-remove-spaces').classList.toggle('option-applied', !isSpacesRemoved)
document.querySelector('#after-remove-spaces').classList.toggle('option-applied', isSpacesRemoved)
countSvgSize(removeSpacesApplied)
return removeSpacesApplied}