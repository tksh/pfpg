import { resultInfo } from 'constants'

export function storeShorter(currentShortestByGroups, encodedStrByGroups, baseXNumber) {

    console.log('encodedStrByGroups: ', encodedStrByGroups)
    // Map(3) {0 => string, 1 => string, 2 => string}

    for (let [gId, encodedStr] of encodedStrByGroups) {

        if (encodedStr[0].length < currentShortestByGroups.get(gId)[0].length) {

            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log(
                `Updated: Current (baseXNumber=${pad(baseXNumber, 2)}, gId=${gId}) encoded string length ${pad(encodedStr[0].length, 2)}`
                + ` is shorter than before (${pad(currentShortestByGroups.get(gId)[0].length, 3)}),`
                + ` the value like "${encodedStr[0].slice(0, 10)} ... ${encodedStr[0].slice(-5)}"`
            )
            currentShortestByGroups.set(gId, [encodedStr[0], 'bruteforce53', { baseXNumber }])
            // Values structure: [encoded string, encoding-method name, configuration-value object]

            const firstFlag  = encodedStr[0].split('=')[1][0]
            const secondFlag = '0'  // '0' means encoded by 'bruteforce53'
            resultInfo.set(`bruteforce53FlagsOfGroupId=${gId}`, ([firstFlag, secondFlag]))
        }

        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }

    return currentShortestByGroups
}


// From number to padded string, with some spaces
function pad(inputNumber, numberOfPadding) {
    return inputNumber.toString().padStart(numberOfPadding, ' ')
}