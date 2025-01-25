import { getSvgString }               from 'button/download-as-file'
import { resvgOption }                from 'state/resvg-option'
import { updateState }                from 'state/url-state-manager'
import { executeSvg2png }             from 'svg-to-png'
import { getGroupColorsAsJoinedHex }  from 'tab-lines/encode-colors-as-hex'
import { generateGroupColorsSvgTags } from 'tab-lines/group-colors-generator'
import { getOpacity
       , getStroke
       , getStrokeOpacity
       , regexMatchesOfGroupColors}   from 'tab-lines/get-colors-from-svg'
import { replaceAtIndex }             from 'utils/replace-at-index'
import { getNumberOfGroups }          from 'utils/get-number-of-groups'

export {

    replaceAndRender
}

// Add multiple event listener for whole stroke groups.
// Group colors attributes are 'stroke', 'opacity', and 'stroke-opacity'.

export function initGroupColorsInputs() {

    const numberOfGroups = getNumberOfGroups(getSvgString())
    console.log('numberOfGroups: ', numberOfGroups)
    // addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')

}

 /**
 / @attrName string - 'opacity' | 'stroke-opacity'
*/
export function addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, attrName) {

    // id `group-colors-${attrName}-N` の要素の変更を監視
    for (let i = 0; i < numberOfGroups; i++) {
        const elementId = `group-colors-${attrName}-${i}`
        //console.log('elementId: ', elementId) // group-colors-${attrName}-0

        const element = document.querySelector(`#${elementId}`)
        console.log('i, element: ', i, element)
        // e.g.: i, element:  0 <select id="group-colors-opacity-0" class="opacity" name="group-colors-opacity-0">

        element.addEventListener('change', function (event) {

            const inputValue = event.target.value  // 'attrName' の input値を 取得
            console.log(`'${attrName}' changes to ${inputValue}`)

            // elementId最後の idの数値のみ を抽出して 変更されたグループの indexナンバー を特定
            const gId = parseInt(elementId.replace(`group-colors-${attrName}-`, ''), 10)
            //console.log('gId: ', gId)                 // e.g: 0, 1, 2 ...
            //console.log('typeof(gId): ', typeof(gId)) // number

            replaceAndRender(inputValue, attrName, gId, resvgOption)
        })
    }
}

function replaceAndRender(inputValue, attrName, gId, resvgOption) {

    // Get the matches for <g> from current SVG string in textarea
    const svgString = getSvgString()
    const matches = regexMatchesOfGroupColors(svgString)
    //console.log('matches: ', matches)
    // e.g: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', ... '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

    // Get three group colors value
    const stroke = getStroke(matches[gId])        // RGB or HEX string: "rgb(0,0,0)" / "#000000"
    const opacity = getOpacity(matches[gId])       // [0-1] number
    const strokeOpacity = getStrokeOpacity(matches[gId]) // [0-1] number


    // Generate the array with input value, as same structured like regex '.match()' object
    let groupColorsArr = []

    if (attrName === 'stroke') {
        groupColorsArr = [
            undefined,     // [0] = undefined
            inputValue,    // [1] = value of stroke
            opacity,       // [2] = value of opacity
            strokeOpacity  // [3] = value of stroke-opacity
        ]
    } else if (attrName === 'opacity') {
        groupColorsArr = [
            undefined,     // [0] = undefined
            stroke,        // [1] = value of stroke
            inputValue,    // [2] = value of opacity
            strokeOpacity  // [3] = value of stroke-opacity
        ]
    } else if (attrName === 'stroke-opacity') {
        groupColorsArr = [
            undefined,     // [0] = undefined
            stroke,        // [1] = value of stroke
            opacity,       // [2] = value of opacity
            inputValue     // [3] = value of stroke-opacity
        ]
    }
    //console.log('groupColorsArr: ', groupColorsArr)
    // e.g: (4) [undefined, '#FF0000', '0.8', '1']

    // Generate the <g> element string
    const changedGroupElem = generateGroupColorsSvgTags(groupColorsArr)
    //console.log('changedGroupElem: ', changedGroupElem)
    // e.g: <g stroke="#FF7523" opacity="1" stroke-opacity="1">

    // Replace the changed <g> element via specific group ID
    const pattern = /<g stroke=[^>]*>/g
    const updatedSvg = replaceAtIndex(svgString, pattern, changedGroupElem, gId)

    // Update the svg string in html
    document.querySelector('#svg-string').value = updatedSvg

    // Update the states
    const groupColorsHexString = getGroupColorsAsJoinedHex(updatedSvg)
    updateState('groupColors', groupColorsHexString)

    // Rendering the PNG image
    executeSvg2png({ target: { value: updatedSvg } }, resvgOption)
}
