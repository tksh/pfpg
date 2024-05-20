// Whole group strings joined with '&' (ampersand sign)

function joinWithAmpersand(encodedStrByGroupMap) {
    // values()メソッドで 各グループの文字列 だけを配列で取得
    const wholeGroupString = [...encodedStrByGroupMap.values()]

    // Join the whole group string with '&'
    const wholeGroupsJoined = wholeGroupString.join('&')
    //console.log('wholeGroupsJoined.length: ', wholeGroupsJoined.length)

    return wholeGroupsJoined
}