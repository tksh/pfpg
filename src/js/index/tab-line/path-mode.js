// 選択された path-mode で URL Params から デコードし直す
function decodeAsSelectedPathMode(pathMode) {
    if (pathMode === 'relativeMerged') {
        console.log('Path mode: Relative and merged')
        return decode(isRelOrAbsBool = true, isDataManipulatorOrIndexBool, svgOutputTextAreaId)
    } else { // (value === 'absoluteSeparated')
        console.log('Path mode: Absolute and separated')
        return decode(isRelOrAbsBool = false, isDataManipulatorOrIndexBool, svgOutputTextAreaId)
    }
}

// Recover the option values like
//  - Anti-aliasing
//  - Base color
//  - Shape to trim

function recoverCurrentOptionValue(svgString, regexPattern, valueString) {
    return svgString.replace(regexPattern, valueString);
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
