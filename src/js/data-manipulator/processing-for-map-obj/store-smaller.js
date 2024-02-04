// Store the smallest length sting for each group

function storeSmaller(currentSmallestByGroup, encodeStrByGroup) {
    for (let [groupId, encodedStr] of encodeStrByGroup) {
        if (encodedStr.length < currentSmallestByGroup.get(groupId).length) {
            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log('Check: これまでよりも 今回の方がサイズが 小さい / groupId, encodedStr: ', groupId, encodedStr)
            currentSmallestByGroup.set(groupId, encodedStr)
        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }
    return currentSmallestByGroup
}