// Whole group strings joined with '&' (ampersand sign)

export function joinWithAmpersand(encodedStrByGroupsMap) {
    // values()メソッドで 各グループの文字列 だけを配列で取得
    const wholeGroupString = [...encodedStrByGroupsMap.values()]

    // Join the whole group string with '&'
    const wholeGroupJoined = wholeGroupString.join('&')
    //console.log('wholeGroupJoined.length: ', wholeGroupJoined.length)

    return wholeGroupJoined
}