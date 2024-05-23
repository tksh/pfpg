function bruteforce53Dec(encodedDvalsStr, threeFlags) {
    //console.log("threeFlags: ", threeFlags)
    //console.log("encodedDvalsStr: ", encodedDvalsStr)

    const baseX = base53Decode(threeFlags[2]) // 3rd char indicates Base X number
    const maxCodebookSize = 52 - baseX
    console.log('baseX: ', baseX)
    console.log('maxCodebookSize: ', maxCodebookSize)

    // Split into eight elements: [x1RefDict]-[x1Diff]-[y1RefDict]-[y1Diff]-[x2RefDict]-[x2Diff]-[y2RefDict]-[y2Diff]
    const refDictAndDiff = encodedDvalsStr.split('-')

    // Split into two arrays: Reference dictionary and encoded diff
    const { refDictByColumn, diffByColumn } = refDictAndDiff.reduce((acc, val, index) => {
        if (index % 2 === 0) {
            acc.refDictByColumn.push(val);  // Even index number elements
        } else {
            acc.diffByColumn.push(val);      // Odd index number elements
        }
        return acc;
    }, { refDictByColumn: [], diffByColumn: [] });

    //console.log("refDictByColumn: ", refDictByColumn) // 頻出数値が無い column の場合には 空の文字列が 返ってくる
    // Array(4) [ "ctcscpcrbWcmcocKcZ", "cscrctcncocpcjclcqcH", "ctcscr", "ctcscr" ]
    //console.log("diffByColumn: ", diffByColumn)
    // Array(4) [ "21XZVVZfccd80UdeYS3Ybj90fjdcRWhgajfb501T5RR10200TR308W1001RS1U43eg3T4X55S0dj8R10SRfedi30UT461R0010Reb5U5S", "gjbjR ... " ]


    // Processing for each columns from x1 [0] to y2 [3]
    let decodedDiffColumns = []
    for (let i = 0; i < 4; i++) {

        // Get the codebook as actual size
        const actualCodebookSize = getActualCodebookSize(maxCodebookSize, refDictByColumn[i])
        const codebook = createCodebookToDecodeFrequentDiff(refDictByColumn[i], actualCodebookSize)



        // Decode the diff
        const decodedDiffArr = decodeDiff(
            diffByColumn[i],
            codebook,
            baseX,
        )
        console.log('decodedDiffArr: ', decodedDiffArr)
        // e.g.: Array(484) [ 7, 10, -3, -3, -12, -13, -17, 6, 54, -47, … ]

        // Push to merge four columns into one array: [x1, y1, x2, y2]
        decodedDiffColumns.push(decodedDiffArr)
    }
    return decodedDiffColumns
}
