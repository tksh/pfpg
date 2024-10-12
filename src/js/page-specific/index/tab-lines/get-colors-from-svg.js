export
    { getGroupColorsValues
    , getOpacity
    , getStroke
    , getStrokeHex
    , getStrokeOpacity
    , getStrokeRgb
    , regexMatchesOfGroupColors
    }

function getGroupColorsValues(svgString) {

    // Find whole group colors elements

    // Get the matches for <g> from current SVG string in textarea
    const matches = regexMatchesOfGroupColors(svgString)
    // console.log(`matches Array: ${matches}`)
    // e.g.: <g stroke="#AAAAAA" opacity="1.0" stroke-opacity="1.0">,<g stroke="#000000" opacity="1.0" stroke-opacity="1.0">,<g stroke="#FFFFFF" opacity="1.0" stroke-opacity="1.0">
    // e.g.: (5) ['<g stroke="rgb(0,0,0)" opacity="1.0" stroke-opacity="1.0">', ...]

    // マッチした部分の数を取得
    const numberOfGroups = matches.length // 配列の長さでマッチした部分の数を得る


    // Get each color as hex code
    // カラーピッカー生成時に 初期値として設定するために マッチした部分の内容から各カラー情報の値を 取り出し
    let strokeArray = []
    let opacityArray = []
    let strokeOpacityArray = []

    for (let i = 0; i < matches.length; i++) { // i = group ID
        // Get three group colors value
        const stroke        = getStroke(matches[i])             // string (rgb or hex)
        const opacity       = getOpacity(matches[i])            // [0-1] number
        const strokeOpacity = getStrokeOpacity(matches[i])      // [0-1] number

        // Set into each array
        strokeArray.push(stroke)
        opacityArray.push(opacity)
        strokeOpacityArray.push(strokeOpacity)
    }

    console.log('strokeArray: ', strokeArray)                // e.g.: (5) ['#000000', '#000000', '#000000', '#eeeeee', '#ffffff']
    console.log('opacityArray: ', opacityArray)              // e.g.: (5) ['1', '1', '1', '1', '1']
    console.log('strokeOpacityArray: ', strokeOpacityArray)  // e.g.: (5) ['1', '1', '1', '1', '1']

    return new Map([
        ['number_of_groups', numberOfGroups],         // Number
        ['stroke_array', strokeArray],                // Array
        ['opacity_array', opacityArray],              // Array
        ['stroke_opacity_array', strokeOpacityArray]  // Array
    ])
}

// Get the values from group colors <g> element string
function regexMatchesOfGroupColors(inputSvg) {
    const pattern = /<g stroke=[^>]*>/g
    const matches = inputSvg.match(pattern) // matchメソッドで配列を返す
    // console.log('matches: ', matches)
    // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']
    return matches
}

// Get each attrs values
function getStroke(inputStr) {
    const strokeRgb = getStrokeRgb(inputStr)
    const strokeHex = getStrokeHex(inputStr)
    return strokeRgb??strokeHex  // undefined ではない方を 返す
}
function getStrokeHex(inputStr) {
    const pattern = /(#.*?)"/
    const matches = inputStr.match(pattern)
    return matches?.[1]  // matches が null または undefined の場合に undefined を返し それ以外の場合には matches[1] の値
}
function getStrokeRgb(inputStr) {
    const pattern = /(rgb\(.*?\))/
    const matches = inputStr.match(pattern)
    return matches?.[1]  // matches が null または undefined の場合に undefined を返し それ以外の場合には matches[1] の値
}

function getOpacity(inputStr) {
    const pattern = /\sopacity="([^"]*)"/
    const matches = inputStr.match(pattern)
    return matches?.[1]
}
function getStrokeOpacity(inputStr) {
    const pattern = /stroke-opacity="([^"]*)"/
    const matches = inputStr.match(pattern)
    return matches?.[1]
}
