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


// bestMixShortest = storeShorter([bruteforce53Map, bigint64Map], encodingMethodNames);
export function storeShortest(encodedResultsArr, encodingMethodNamesArr) {
    //console.log('currentShortestByGroup, encodedStrByGroup: ', currentShortestByGroup, encodedStrByGroup)

    const shortestArrByGroup = new Map()

    // number of lines-group
    // console.log(encodedResultsArr[0].size)  // e.g.: 3

    // Looping for each lines-group
    for (let i = 0; i < encodedResultsArr[0].size; i++) {

        //console.log("encodedResultsArr: ", encodedResultsArr)
        /*
        (2) [Map(3), Map(3)]
            0: Map(3) {0 => 'A=08T6FAhdHhNtMe0ws2FHUnU6v', 1 => '0=08TyWYjdO4r...
            1: Map(3) {0 => 'A=~13127b-NWrTPcKpRSjaX', 1 => '0=~135n3ap2bI...
        */

        // Use index number 'i' as key(group ID) of Map to get the array of encoded string length
        const strArrByMethod = encodedResultsArr.map(mapObjByMethod => mapObjByMethod.get(i))
        console.log(strArrByMethod) // e.g.: (2) ['A=08T6FAhdHhNtMe0ws2FHUnU6v', 'A=~13127b-NWrTPcKpRSjaX']

        const strLengthArrByMethod = strArrByMethod.map(str => str.length)
        console.log(strLengthArrByMethod)  // e.g.: (2) [27, 23]

        // Select shortest string
        const minLength = Math.min(...strLengthArrByMethod)
        console.log(minLength)    // e.g.: 23

        // Get the index of minLength
        const minIndex = strLengthArrByMethod.indexOf(minLength)
        console.log(minIndex)     // e.g.: 1

        // Get the name of encoding method
        const methodName = encodingMethodNamesArr[minIndex]
        console.log(methodName)   // e.g.: 'bigint64'

        // Get shortest string
        const shortestStr = strArrByMethod[minIndex]
        console.log(shortestStr)  // e.g.: 'A=08T6FAhdHhNtMe0ws2FHUnU6v'


        // Store the shortest results values with group ID as key
        shortestArrByGroup.set(
            `${i}`, [         // Group ID
                shortestStr,  // shortest encoded string
                minLength,    // shortest encoded string's length
                methodName    // shortest encoded string's method name
            ]
        )
    }

    return shortestArrByGroup
}