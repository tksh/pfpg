import { createCodebook
       , get63Numbers
       , get63Characters }             from 'enc-and-dec/d-values/swap63/create-codebook'
import { getEncodedAttrsExceptsDvals } from 'encode/get-attrs-excepts-dvals'
import { joinWithAmpersand }           from 'encode/join-with-ampersand'
import { showStringSize
       , showDetailsByGroup }          from 'encode/show-result'
import { tryCompress }                 from 'encode/try-compress'



// Replace each number of relative d values (-31 to 31) with a character from the set [0-9, a-z, A-Z, _]

export function swap63Enc() {
    const startTime = performance.now()

    // Codebook to encode from number to character
    codebookForEncoding = createCodebook(get63Numbers(), get63Characters())
    console.log('codebookForEncoding: ', codebookForEncoding);
    // Map(63) { -31 → "0", -30 → "1", -29 → "2", -28 → "3", -27 → "4", -26 → "5", -25 → "6", -24 → "7", -23 → "8", -22 → "9", … }


    // Lines Data
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
    //console.log('linesDataMap: ', linesDataMap) // Map { 0 → {…}, 1 → {…} }


    // Get the string of d values encoded
    const encodedDval = swapToEncode(codebookForEncoding, linesDataMap)
    console.log('encodedDval: ', encodedDval)
    // Map(5) {'1' => 'wyyvtuDw ... WytEBzzAx', '2' => 'v9oswnHvnuz ... wwxyuwxw', ... }



    // Try compress and add prefix

    // 1. Prepend the encoded stroke-width value and counts to the beginning of encoded d values
    // 2. Compress the combined string using URLCompressor and choose the shorter version.
    // 3. Prepend the encoded group-colors value to the chosen string (compressed or original).

    // Format: [group-colors]=[width-and-counts]-[d-values]


    // Get the encoded strings of width-and-counts and group-colors
    const encodedAttrsExceptsDvals = getEncodedAttrsExceptsDvals()

    // Choose shorter one between URLComp applied or not, by each group
    const compressedByGroup = tryCompress(
        encodedDval,
        encodedAttrsExceptsDvals,
        'swap63-enc',
        null  // value for 3rd flag char, swap63-enc needs no 3rd flag char to encode
    )
    console.log('compressedByGroup: ', compressedByGroup)
    // Map { 000 → (2) […] }
    //     0: 000 → Array [ 400, "000=13xbqDCEgLL7jANz5XKXua ... LiAh5KEXgVutC" ]



    // Whole group strings joined with '&' (ampersand sign)
    const wholeGroupsJoined = joinWithAmpersand(compressedByGroup)



    // Output to textarea
    outputToTextarea(wholeGroupsJoined, 'textarea-strokes-values-encoded')
    // 000=19gUZa0HMswFYl ... lCLwK3WhT

    // Show the size of result in html and console
    showStringSize('Lines Data', wholeGroupsJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('swap63Enc()', elapsedTime, 'encoded-strokes-values-time')

    // Show the encoding result of each group in console
    showDetailsByGroup('Lines Data', compressedByGroup)

    return compressedByGroup
}



// Get the encoded string of d values as Map
function swapToEncode(dictMap, linesDataMap) {
    //console.log(dictMap); // Map(63) {-31 => '0', -30 => '1', -29 => '2', -28 => '3', -27 => '4', …}

    const encodedDvals = new Map()

    for (const linesData of linesDataMap.values()) {

        // A variable to store the encoded string of d values
        // Joined whole columns (x1, y1, x2, y2) without spaces
        let encodedDval = ""

        // relative d values array in obj, x1 to y2
        const relDvals = linesData.d.relative

        // Assume all x1 to y2 arrays have the same length, get length from x1
        const numberOfPath = (linesData.d.relative.x1).length // x1 to y2 arrays have same length

        // Swap from number to char
        for (let key in relDvals) {
            //console.log('key: ', key)  // x1, y1, x2, y2
            const dval = relDvals[key]
            //console.log(dval); // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]

            // Encode and append
            encodedDval += swapFromNumberToCharacter(dval, numberOfPath, dictMap)
        }

        encodedDvals.set(linesData.g_id, encodedDval)
    }
    return encodedDvals
}



function swapFromNumberToCharacter(dval, numberOfPath, dictMap) {

    let dvalEncoded = ''

    // Use the original d value as an index to look up a character from the keys list and append it to the symbol string variable
    for (let i = 0; i < numberOfPath; i++) {
        const encodedChar = dictMap.get(dval[i]);
        dvalEncoded += encodedChar
    }

    return dvalEncoded
}