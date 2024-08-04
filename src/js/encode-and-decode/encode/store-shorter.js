// Compare and store the shortest length string by each group

export function storeShorter(currentShortestByGroup, encodedStrByGroup, baseXNumber) {
    //console.log('currentShortestByGroup, encodedStrByGroup: ', currentShortestByGroup, encodedStrByGroup)
    for (let [gId, encodedStr] of encodedStrByGroup) {
        if (encodedStr.length < currentShortestByGroup.get(gId).length) {
            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            currentShortestByGroup.set(gId, encodedStr)
            console.log(`Updated: Current encoded string (encodedStr) is shorter than before: baseXNumber=${baseXNumber}, g_id=${gId}, ${encodedStr.length} (current) < ${currentShortestByGroup.get(gId).length} (before)`)
        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }
    return currentShortestByGroup
}