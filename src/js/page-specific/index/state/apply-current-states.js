import { getState } from 'state/state-as-map-obj'
import { decodeGroupColors } from 'tab-lines/decode-colors-as-array'
import {
    generateGroupColorsHtmlElements,
    generateGroupColorsSvgTags
} from 'tab-lines/group-colors'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
import { replaceAtIndex } from 'utils/replace-at-index'


export function applyCustomization(svgString, paramsOfImageCustomization) {
    console.log("paramsOfImageCustomization: ", paramsOfImageCustomization)
    // e.g:
    // Map(3) {'pathMode' => 'absoluteSeparated', 'shapeRendering' => 'crispEdges', 'opacitySteps' => '0.2'}
    // [[Entries]]
    // 0: {"pathMode" => "absoluteSeparated"}
    // 1: {"shapeRendering" => "crispEdges"}
    // 2: {"opacitySteps" => "0.2"}
    // 3: {"groupColors" => "44AA63CC66_000_FFF"}
    // size: 3
    // [[Prototype]]: Map

    let updatedSvg = svgString

    // Apply the image customization values via url params if exists
    const groupColorsValue = getState('groupColors')
    if (groupColorsValue) {
        updatedSvg = applyGroupColors(svgString, groupColorsValue)
    }

    return updatedSvg
}

function applyGroupColors(svgString, value) {

    // Decode the group colors value
    // - from: Hex string that has joined whole groups with '_'
    // -   to: Array structured same as regex '.match()' method returns.
    // - Type: Array of arrays
    const colorFormat = getState('colorFormat')
    const groupColorsByGroups = decodeGroupColors(value, colorFormat)

    // Generate the <g> element string
    // - Type: Array of strings
    const gElemByGroups = groupColorsByGroups.map(groupColorsArr => generateGroupColorsSvgTags(groupColorsArr))
    console.log('gElemByGroups: ', gElemByGroups)
    // e.g.: (3) ['<g stroke="#38AA34" opacity="1" stroke-opacity="1">', '<g stroke="#000" opacity="1" stroke-opacity="1">', '<g stroke="#FFF" opacity="1" stroke-opacity="1">']

    // Replace the whole groups <g> element, via group ID = index number of array
    const pattern = /<g stroke=[^>]*>/g
    let updatedSvg = svgString

    // Replace each group element
    gElemByGroups.forEach((gElem, gId) => {
        // Here, assign the result of replaceAtIndex back to updatedSvg
        updatedSvg = replaceAtIndex(updatedSvg, pattern, gElem, gId);
    })

    // HTMLを 新しい表示フォーマットの js-color input に更新
    // generateGroupColorsHtmlElements(colorFormat, getState('opacitySteps'))
    generateGroupColorsHtmlElements(updatedSvg, colorFormat, getState('opacitySteps'))
    // Add event listener for new format js-color inputs and opacity selectors
    const numberOfGroups = getNumberOfGroups(svgString)
    addEventListenerForGroupColorsInputs(numberOfGroups, svgString, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, svgString, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, svgString, 'stroke-opacity')

    return updatedSvg
}


// function addEventListeners(numberOfGroups, svgString, attrName) {

//     for (let i = 0; i < numberOfGroups; i++) {

//         const elementId = `group-colors-${attrName}-${i}`

//         const element = document.querySelector(`#${elementId}`)
//         console.log('i, element: ', i, element) // 0 <input type=​"number" min=​"0" max=​"1" step=​"0.1" value=​"1" id=​"group-colors-${attrName}-0">​

//         element.addEventListener('change', function (event) {

//             const inputValue = event.target.value  // 'attrName' の input値を 取得
//             console.log(`'${attrName}' changes to ${inputValue}`)

//             // elementId最後の idの数値のみ を抽出して 変更されたグループの indexナンバー を特定
//             const gId = elementId.replace(`group-colors-${attrName}-`, '')
//             //console.log('gId: ', gId)                 // e.g: '0', '1', '2' ...
//             //console.log('typeof(gId): ', typeof(gId)) // string

//             // Get the matches
//             const matches = regexMatchesOfGroupColors(svgString)
//             console.log('matches: ', matches)
//             // e.g: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

//             // Get three group colors value
//             const stroke = getStroke(matches[i])
//             const opacity = getOpacity(matches[i])       // [0-1] number
//             const strokeOpacity = getStrokeOpacity(matches[i]) // [0-1] number

//             // Generate the array with input value, as same structured like regex '.match()' object
//             let groupColorsArr = []
//         }
//     }
// }
