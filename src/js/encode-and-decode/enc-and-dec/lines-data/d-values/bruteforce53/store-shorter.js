import { flagsMap
       , resultInfo } from 'constants'

export function storeShorter(currentShortestByGroups, encodedStrByGroups, baseXNumber) {

    console.log('encodedStrByGroups: ', encodedStrByGroups)
    // Map(3) {0 => string, 1 => string, 2 => string}
    //let flagsByGroupsArr = []

    for (let [gId, encodedStr] of encodedStrByGroups) {

        if (encodedStr[0].length < currentShortestByGroups.get(gId)[0].length) {

            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log(
                `||||Updated: Current (baseXNumber=${baseXNumber}, gId=${gId}) encoded string length ${encodedStr[0].length}`
                + ` is shorter than before (${currentShortestByGroups.get(gId)[0].length}),`
                + ` the value like "${encodedStr[0].slice(0, 10)} ... ${encodedStr[0].slice(-5)}"`
            )
            currentShortestByGroups.set(gId, [encodedStr[0], 'bruteforce53', { baseXNumber }])
            // Values : [encoded string, encoding-method name, configuration-value object]

            const firstFlag = encodedStr[0].split('=')[1][0]
            const compMethodNameDetected = flagsMap.get('rev_1st').get(firstFlag)
            const currentFlagsByGroups = resultInfo.get('bruteforce53 Flags')
            console.log("||||currentFlagsByGroups:", currentFlagsByGroups)
            console.log("||||compMethodNameDetected:", compMethodNameDetected)

            const secondFlag = '0'  // encoded by 'bruteforce53'
            resultInfo.set(`bruteforce53FlagsOfGroupId=${gId}`, ([firstFlag, secondFlag]))
            // flagsByGroupsArr.push([firstFlag, secondFlag])
            //currentFlagsByGroups
            //resultInfo.set('bruteforce53 Flags', )

        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }

    //resultInfo.set('bruteforce53 Flags', flagsByGroupsArr)
    console.log("||||||||resultInfo.get('bruteforce53 Flags'):", resultInfo.get('bruteforce53 Flags'))

    return currentShortestByGroups
}
