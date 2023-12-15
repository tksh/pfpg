function bestMixFrom3Methods() {
    // Read the result of whole encoding methods
    const bruteforce52Map = bruteforce52Enc()
    const bigint64Map = bigint64Enc()
    const swap63Map = swap63Enc()

    // Compare and get the smallest one by group
    const firstCompareResult = storeSmaller(bruteforce52Map, bigint64Map)
    const bestMixResultMap = storeSmaller(firstCompareResult, swap63Map)


    // Whole group strings joined with `&`
    const smallestJoined = joinWithAnd(bestMixResultMap)

    // Output to textarea
    outputToTextarea(smallestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Strokes Values (Best mix)', smallestJoined, 'encoded-strokes-values-size')

    // Show the details of encoding result by group in console
    showDetailsByGroup('Strokes Values', bestMixResultMap)
}


function bestMixFrom2sMethods() {
    // Read the result of whole encoding methods
    const bruteforce52Map = bruteforce52Enc()
    const bigint64Map = bigint64Enc()

    // Compare and get the smallest one by group
    const bestMixResultMap = storeSmaller(bruteforce52Map, bigint64Map)


    // Whole group strings joined with `&`
    const smallestJoined = joinWithAnd(bestMixResultMap)

    // Output to textarea
    outputToTextarea(smallestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Strokes Values (Best mix)', smallestJoined, 'encoded-strokes-values-size')

    // Show the details of encoding result by group in console
    showDetailsByGroup('Strokes Values', bestMixResultMap)
}