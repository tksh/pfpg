import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'

// Create the codebook

export function createCodebookToDec(freqDiffArr, actualCodebookSize) {
    // Key  : Alphabets
    // Value: Frequent diff value

    // Alphabets
    const alphabets = getAlphabetsForCodebook(actualCodebookSize)

    // Set the kv pair into Map()
    const codebook = new Map()

    for (let i = 0; i < freqDiffArr.length; i++) {
        codebook.set(alphabets[i], freqDiffArr[i])
    }
    return codebook
}

