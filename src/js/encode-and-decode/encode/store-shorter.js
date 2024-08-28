import { flagsMap, resultInfo } from 'constants'

// Compare and store the shortest length string by each group

export function storeShorter(currentShortestByGroup, encodedStrByGroup, baseXNumber) {
    //console.log('currentShortestByGroup, encodedStrByGroup: ', currentShortestByGroup, encodedStrByGroup)
    for (let [gId, encodedStr] of encodedStrByGroup) {
        if (encodedStr.length < currentShortestByGroup.get(gId).length) {
            // これまでよりも 今回の方がサイズが 小さければ 値を更新する
            console.log(`Updated: Current encoded string (encodedStr) is shorter than before: baseXNumber=${baseXNumber}, g_id=${gId}, ${encodedStr.length} (current) < ${currentShortestByGroup.get(gId).length} (before)`)
            currentShortestByGroup.set(gId, [encodedStr, 'bruteforce53', { baseXNumber }])
            // Values : [encoded string, encoding-method name, configuration value object]
        }
        // これまでよりも 今回の方が サイズが 同じか より大きければ 何もしない
    }
    return currentShortestByGroup
}


// bestMixShortest = storeShorter([bruteforce53Map, bigint64Map], encodingMethodNames);
export function storeShortest(encodedResultsArr, encodingMethodNamesArr) {
    //console.log('currentShortestByGroup, encodedStrByGroup: ', currentShortestByGroup, encodedStrByGroup)

    const shortestArrByGroup = new Map()

    // For storing result info
    let flagsArr= []

    // number of lines-group
    // console.log(encodedResultsArr[0].size)  // e.g.: 3

    // Looping for each lines-group
    for (let i = 0; i < encodedResultsArr[0].size; i++) {

        console.log("encodedResultsArr: ", encodedResultsArr)
        /*
        e.g.: bestMixFrom2methods()
       (2) [Map(3), Map(3)]                                                        // Two maps = [bruteforce53Map, bigint64Map]
            0: Map(3)                                                              // bruteforce53Map
                [[Entries]]
                0: {0 => Array(3)}
                    key: 0
                    value: (3) ['A=08fEKQ-VoisNalNhZy9GsmZzPU', 28, 51]
                1: {1 => Array(3)}
                2: {2 => Array(3)}
                size: 3
                [[Prototype]]: Map
            1: Map(3) {0 => 'A=~1127b-NWrTPcKpRSjaX', 1 => '0=~15n3a ... pUnRU'}   // bigint64Map
                [[Entries]]
                0: {0 => "A=~1127b-NWrTPcKpRSjaX"}
                1: {1 => "0=~15n3ap2bI1fR-IBdbr ... -jtGE"}
                2: {2 => "F=~11w-B2a ... B7pUnRU"}
                size: 3
                [[Prototype]]: Map
            length: 2
            [[Prototype]]: Array(0)
        */

        // Use index number 'i' as key(group ID) of Map to get the array of encoded string length
        const strArrByMethod = encodedResultsArr.map(mapObjByMethod => mapObjByMethod.get(i))
        console.log(strArrByMethod)
        // Structures are not same by each encoding methods
        // e.g.:
        //     0 (bruteforce53): Array (3) ['0=08cJqY-3JMVTyH83WQ8fKCNJA3CGg5VQzdLGzfyFclSCIDR6…nnh0D6N-j_h82wSYB7kmuAVW9PZgTnAaaHuIXiam3qZcphrSl', 2646, 51]
        //     1 (bigint64)    : String "0=~15n3ap2bI1fR-IBdbrkwCjiFCdD1xVpRSu8eawc

        const strLengthArrByMethod = strArrByMethod.map(str => str.length)
        console.log(strLengthArrByMethod)  // e.g.: (2) [27(bruteforce53), 23(bigint64)]

        // Select shortest string
        const minLength = Math.min(...strLengthArrByMethod)
        console.log(minLength)    // e.g.: 23(bigint64)

        // Get the index of minLength
        const minIndex = strLengthArrByMethod.indexOf(minLength)
        console.log(minIndex)     // e.g.: 1

        // Get the name of encoding method
        const methodName = encodingMethodNamesArr[minIndex]
        console.log(methodName)   // e.g.: 'bruteforce53'

        // Get shortest elements array
        const shortestArr = strArrByMethod[minIndex]
        console.log(shortestArr)  // e.g.: // (3) ['A=08fEKQ-VoisNalNhZy9GsmZzPU', 28, 51]

        // Get shortest string
        const shortestStr = shortestArr[0]
        console.log(shortestArr)  // 'A=08fEKQ-VoisNalNhZy9GsmZzPU'

        // Store the shortest results values with group ID as key
        shortestArrByGroup.set(`${i}`, [shortestStr, shortestStr.length, methodName])


        console.log("shortestStr.split('='): ", shortestStr.split('='))  // e.g.: (2) ['A', '08fEKQ-VoisNalNhZy9GsmZzPU']
        // Store for console output
        const charOf1stFlag = shortestStr.split('=')[1][0]          // the 1st char after '=' is compression method flag
        console.log(charOf1stFlag)                                  // e.g.: 0 (= URLCompressor applied)
        const charOf2ndFlag = flagsMap.get('2nd').get(methodName)   // the 2nd char is encoding method flag that got from its name
        console.log(charOf2ndFlag)                                  // e.g.: 0 (= bruteforce53 applied)

        flagsArr.push([charOf1stFlag, charOf2ndFlag])
    }

    // Store result info
    const bestMixFlags = new Map([['flags', [...flagsArr]]])
    console.log("bestMixFlags: ", bestMixFlags)  // key: "flags", value: Array(3)

//    const testMap = new Map([
//        ['flags', [[0,0],[0,0],[0,0]]]
//    ])
//    resultInfo.set('best-mix', testMap)  // 'resultInfo' is imported Map
    resultInfo.set('best-mix', bestMixFlags)  // 'resultInfo' is imported Map
    console.log("resultInfo: ", resultInfo)  // Map under 'best-mix' has key "flags", but value is Array(0)

    console.log("||||shortestArrByGroup: ", shortestArrByGroup)
    return shortestArrByGroup
}