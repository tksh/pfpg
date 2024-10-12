import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }          from 'decode/decode'
import { replaceAtIndex }          from 'utils/replace-at-index'

export
    { decodeAsSelectedPathMode
    , recoverCurrentOptionValue
    , recoverCurrentGroupColorsValues
    }

// 選択された path-mode で url params から デコードし直す
function decodeAsSelectedPathMode(pathMode) {
    if (pathMode === 'relativeMerged') {
        console.log('Path mode: Relative and merged')
        const isRelative = true
        return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    } else { // (pathMode === 'absoluteSeparated')
        console.log('Path mode: Absolute and separated')
        const isRelative = false
        return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    }
}

// Recover the option values like
//  - Anti-aliasing
//  - Base color
//  - Shape to trim

function recoverCurrentOptionValue(svgString, regexPattern, valueString) {
    return svgString.replace(regexPattern, valueString)
}


// Recover the group colors values like
//   - stroke
//   - opacity
//   - stroke-opacity

function recoverCurrentGroupColorsValues(svgString, regexPattern, regexMatches) {
    let recoveredSvgString = svgString
    for (let gId = 0; gId < regexMatches.length; gId++) {
        const colorsValues = regexMatches[gId]
        recoveredSvgString = replaceAtIndex(recoveredSvgString, regexPattern, colorsValues, gId)
    }
    return recoveredSvgString
}
