import { flagsMap, resultInfo } from 'constants'

// Compare and store the shortest length string by each group

export function storeShortest(encodedResultsArr, encodingMethodNamesArr) {
    //console.log('currentShortestByGroups, encodedStrByGroups: ', currentShortestByGroups, encodedStrByGroups)

    const shortestArrByGroups = new Map()

    // For storing result info
    let flagsArr= []

    // number of lines-group
    // console.log(encodedResultsArr[0].size)  // e.g.: 3

    // Looping for each lines-group
    for (let i = 0; i < encodedResultsArr[0].size; i++) {

        console.log("encodedResultsArr: ", encodedResultsArr)
        // e.g.:
        //   Executed with bestMixFrom2methods().
        //     (2) [Map(3), Map(3)]  // Two maps = [bruteforce53Map, bigint64Map]

        // Use index number 'i' as key(group ID) of Map to get the array of encoded string length
        const strArrByMethod = encodedResultsArr.map(mapObjByMethod => mapObjByMethod.get(i))
        console.log(strArrByMethod)
        // Structures of values are same by each encoding methods like
        //     Values: [encoded string, encoding-method name, configuration-value object]
        // e.g.:
        //   Executed with bestMixFrom2methods().
        //     0 (bruteforce53): Array (3) 
        //         0: "F=08fOlodlaFekVCp-ARYvkXHvz8Poh25aTRmW8j4v5qf1vC0WgNdp-DzgDfJBgsiMsmTOlLs0YNpVslBnQadartJipZ5Mhi6HMRYbqTTAObPe0swdgXfDGdXUdpTApsIEDP"
        //         1: "bruteforce53"
        //         2: {baseXNumber: 51}
        //     1 (bigint64)    : Array (3) [['F=~11w-B2a4FogqwwB0aX-PwIQtlN3FjLk8D68fbZbNuvslJVj…udYdSGZkUg5U-CYP3gwmqXyKxYy9aBzjCyh5cpP3tFB7pUnRU', 'bigint64', {…}]]
        //         0: "F=~11w-B2a4FogqwwB0aX-PwIQtlN3FjLk8D68fbZbNuvslJVjZor6QKA8WlmJ8pDpmwHnJNc5QTH2b56y2NXBd1RT4Ti1cMis0dVIK1VGHehPMudYdSGZkUg5U-CYP3gwmqXyKxYy9aBzjCyh5cpP3tFB7pUnRU"
        //         1: "bigint64"
        //         2: {digitsPerChunk: 3}

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
        console.log(shortestArr)  // e.g.: // (3) ['A=08fEKQ-VoisNalNhZy9GsmZzPU', 'bruteforce53', {baseXNumber: 20}]

        // Set the shortest results values with group ID as key
        shortestArrByGroups.set(`${i}`, shortestArr)


        // Store flags info for console output
        // console.log(shortestArr[0].split('='))  // [0]: group colors , [1]: lines data except colors, e.g. (2) ['A', '08fEKQ-VoisNalNhZy9GsmZzPU']
        const charOf1stFlag = shortestArr[0].split('=')[1][0]          // the 1st char after '=' is compression method flag
        // e.g.: 0 (= URLCompressor applied)
        const charOf2ndFlag = flagsMap.get('2nd').get(methodName)   // the 2nd char is encoding method flag that got from its name
        // e.g.: 0 (= bruteforce53 applied)

        flagsArr.push([charOf1stFlag, charOf2ndFlag])
    }

    // Store flags info for console output
    const bestMixFlags = new Map([['flags', [...flagsArr]]])
    resultInfo.set('best-mix', bestMixFlags)

    return shortestArrByGroups
}