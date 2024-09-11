export function storeShorter(currentShortestByGroups, encodedStrByGroups, baseXNumber) {

    console.log('||||encodedStrByGroups: ', encodedStrByGroups)
    // Map(3) {0 => string, 1 => string, 2 => string}

    for (let [gId, encodedStr] of encodedStrByGroups) {

        if (encodedStr[0].length < currentShortestByGroups.get(gId)[0].length) {

            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log(
                '||||Updated: Current encoded string (encodedStr[0]) is shorter than before: '
                + `baseXNumber=${baseXNumber}, g_id=${gId}, `
                + `${encodedStr[0].length} (current) < ${currentShortestByGroups.get(gId)[0].length} (before)`
            )
            currentShortestByGroups.set(gId, [encodedStr[0], 'bruteforce53', { baseXNumber }])
            // Values : [encoded string, encoding-method name, configuration-value object]

        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }

    return currentShortestByGroups
}
