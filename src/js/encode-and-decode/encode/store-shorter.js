// Store the shortest length sting by each group

function storeShorter(currentShortestByGroup, encodeStrByGroup) {
    for (let [gId, encodedStr] of encodeStrByGroup) {
        if (encodedStr.length < currentShortestByGroup.get(gId).length) {
            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log('Check: これまでよりも 今回の方がサイズが 小さい / gId, encodedStr: ', gId, encodedStr)
            currentShortestByGroup.set(gId, encodedStr)
        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }
    return currentShortestByGroup
}