// Generate the codebook to encode frequent diff_by_row values

// Source symbol of codebook => Value of diff_by_row
// Codeword      of codebook => Alphabets

// Define the size of codebook:
// If      freqDiffArr.length is OVER maxCodebookSize,  => actualCodebookSize.length is maxCodebookSize
// Else if freqDiffArr.length is UNDER maxCodebookSize, => actualCodebookSize.length equals freqDiffArr.length

export function getActualCodebookSize(maxCodebookSize, freqDiffArr) {
    let actualCodebookSize

    if (freqDiffArr.length >= maxCodebookSize) {
        actualCodebookSize = maxCodebookSize
    } else {
        actualCodebookSize = freqDiffArr.length
    }
    return actualCodebookSize
}

// If there is no freq values([]), always return the '0'
// console.log(getActualCodebookSize(0, []))  // 0
// console.log(getActualCodebookSize(52, [])) // 0
