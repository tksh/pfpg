import { base53Dec }             from 'enc-and-dec/base-n/base-53-dec'
import { getActualCodebookSize } from 'enc-and-dec/lines-data/d-values/bruteforce53/actual-codebook-size'
import { createCodebookToDec }   from 'enc-and-dec/lines-data/d-values/bruteforce53/create-codebook-to-dec'
import { decodeFreqDiff }        from 'enc-and-dec/lines-data/d-values/bruteforce53/decode-freq-diff'
import { decodeDiff }            from 'enc-and-dec/lines-data/d-values/bruteforce53/decode-diff'


export function bruteforce53Dec(encodedDvalsStr) {

    const baseX = base53Dec(encodedDvalsStr[0]) // 1st char decoded indicates BaseX number
    const maxCodebookSize = 52 - baseX
    console.log('baseX: ', baseX)
    console.log('maxCodebookSize: ', maxCodebookSize)

    // Split into eight elements: [x1FreqDiff]-[x1Diff]-[y1FreqDiff]-[y1Diff]-[x2FreqDiff]-[x2Diff]-[y2FreqDiff]-[y2Diff]
    const freqDiffAndDiff = encodedDvalsStr.slice(1).split('-')

    // Split into two arrays: Reference dictionary and encoded diff
    const { freqDiffByCoords, diffByCoords } = freqDiffAndDiff.reduce((acc, val, index) => {
        if (index % 2 === 0) {
            acc.freqDiffByCoords.push(val)  // Even index number elements
        } else {
            acc.diffByCoords.push(val)      // Odd index number elements
        }
        return acc
    }, { freqDiffByCoords: [], diffByCoords: [] })

    console.log("freqDiffByCoords: ", freqDiffByCoords) // 頻出数値が無い coord の場合には 空の文字列が 返ってくる
    // Array(4) [ "ctcscpcrbWcmcocKcZ", "cscrctcncocpcjclcqcH", "ctcscr", "ctcscr" ]
    console.log("diffByCoords: ", diffByCoords)
    // Array(4) [ "21XZVVZfccd80UdeYS3Ybj90fjdcRWhgajfb501T5RR10200TR308W1001RS1U43eg3T4X55S0dj8R10SRfedi30UT461R0010Reb5U5S", "gjbjR ... " ]


    let decodedDiffCoords = []

    for (let i = 0; i < 4; i++) {  // Processing for each coords from x1 [0] to y2 [3]

        // Get the codebook as actual size
        const freqDiffEncodedStr = freqDiffByCoords[i]
        const freqDiffDecodedArr = decodeFreqDiff(freqDiffEncodedStr)
        const actualCodebookSize = getActualCodebookSize(maxCodebookSize, freqDiffDecodedArr)
        const codebook = createCodebookToDec(freqDiffDecodedArr, actualCodebookSize)
        //console.log("codebook: ", codebook) e.g.: {'Y' => -2, 'Z' => -24}

        // Decode the diff
        const decodedDiffArr = decodeDiff(
            diffByCoords[i],
            codebook,
            baseX,
        )
        console.log('decodedDiffArr: ', decodedDiffArr)
        // e.g.: Array(484) [ 7, 10, -3, -3, -12, -13, -17, 6, 54, -47, … ]

        // Push to merge coordinate set into an array: [x1, y1, x2, y2]
        decodedDiffCoords.push(decodedDiffArr)
    }

    return decodedDiffCoords
}
