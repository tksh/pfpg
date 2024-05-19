function bestMixFrom3Methods() {
    // Read the result of whole encoding methods
    const bruteforce53Map = bruteforce53Enc()
    const bigint64Map = bigint64Enc()
    const swap63Map = swap63Enc()

    // Compare and get the shortest one by group
    const firstCompareResult = storeShorter(bruteforce53Map, bigint64Map)
    const bestMixResultMap = storeShorter(firstCompareResult, swap63Map)


    // Whole group strings joined with '&' (ampersand sign)
    const shortestJoined = joinWithAmpersand(bestMixResultMap)

    // Output to textarea
    outputToTextarea(shortestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Lines Data (Best mix)', shortestJoined, 'encoded-strokes-values-size')

    // Show the details of encoding result by group in console
    showDetailsByGroup('Lines Data', bestMixResultMap)
}


function bestMixFrom2Methods() {
    // Read the result of whole encoding methods
    const bruteforce53Map = bruteforce53Enc()
    const bigint64Map = bigint64Enc()

    // Compare and get the shortest one by group
    const bestMixResultMap = storeShorter(bruteforce53Map, bigint64Map)


    // Whole group strings joined with '&' (ampersand sign)
    const shortestJoined = joinWithAmpersand(bestMixResultMap)

    // Output to textarea
    outputToTextarea(shortestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Lines Data (Best mix)', shortestJoined, 'encoded-strokes-values-size')

    // Show the details of encoding result by group in console
    showDetailsByGroup('Lines Data', bestMixResultMap)
}