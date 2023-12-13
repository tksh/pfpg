
// Whole color strings joined with `&`

function joinWholeColorStr(encodedStrByColorMap) {
    // values()メソッドで 各色の文字列 だけを配列で取得
    const wholeColorString = [...encodedStrByColorMap.values()]

    // Join the whole colors with '&'
    const wholeColorStrJoined = wholeColorString.join('&')
    //console.log('wholeColorStrJoined.length: ', wholeColorStrJoined.length)

    return wholeColorStrJoined
}

