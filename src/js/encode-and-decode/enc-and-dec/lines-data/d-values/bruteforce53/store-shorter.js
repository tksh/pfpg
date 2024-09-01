export function storeShorter(currentShortestByGroup, encodedStrByGroup, baseXNumber) {

    console.log('||||encodedStrByGroup: ', encodedStrByGroup)
    // Map(3) {0 => string, 1 => string, 2 => string}

    for (let [gId, encodedStr] of encodedStrByGroup) {

        if (encodedStr[0].length < currentShortestByGroup.get(gId)[0].length) {

            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log(
                '||||Updated: Current encoded string (encodedStr[0]) is shorter than before: '
                + `baseXNumber=${baseXNumber}, g_id=${gId}, `
                + `${encodedStr[0].length} (current) < ${currentShortestByGroup.get(gId)[0].length} (before)`
            )
            currentShortestByGroup.set(gId, [encodedStr[0], 'bruteforce53', baseXNumber])
            // Values : [encoded string, encoding-method name, configuration-value object]

        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }

    return currentShortestByGroup
}
