// Whole color strings joined with `&`

function joinStrWithAmpersand(encodedStrByGroupMap) {
    // values()メソッドで 各グループの文字列 だけを配列で取得
    const wholeGroupString = [...encodedStrByGroupMap.values()]

    // Join the whole colors with '&'
    const wholeGroupStrJoined = wholeGroupString.join('&')
    //console.log('wholeGroupStrJoined.length: ', wholeGroupStrJoined.length)

    return wholeGroupStrJoined
}