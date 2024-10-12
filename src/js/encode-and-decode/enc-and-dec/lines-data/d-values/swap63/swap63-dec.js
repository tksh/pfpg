import { createCodebook
       , get63Numbers
       , get63Characters} from 'enc-and-dec/lines-data/d-values/swap63/create-codebook'


export function swap63Dec(encodedDvalsStr) {
    const codebookForDecoding = createCodebook(get63Characters(), get63Numbers())
    // Map(63) { 0 → -31, 1 → -30, 2 → -29, 3 → -28, 4 → -27, 5 → -26, 6 → -25, 7 → -24, 8 → -23, 9 → -22, … }

    const dividedDvals = divideStringEqually(encodedDvalsStr, 4)
    //console.log("dividedDvals: ", dividedDvals)
    // (4) ['wyyvtuDwtzxifJxuvun', 'v56nudvqm96wo9xuuuc', 'vvuzvzAwvvvyzxsvxDy', 'VUSByqATCUWytEBzzAx']

    const decodedRelDvals = dividedDvals.map(dval => swapFromCharacterToNumber(dval, codebookForDecoding))
    //console.log("decodedRelDvals: ", decodedRelDvals)
    // (4) [Array(19), Array(19), Array(19), Array(19)]
    return decodedRelDvals
}


function divideStringEqually(str, numberOfParts) {
    const totalLength = str.length
    const lengthPerPart = Math.ceil(totalLength / numberOfParts)
    const result = []

    for (let i = 0; i < totalLength; i += lengthPerPart) {
        result.push(str.slice(i, i + lengthPerPart))
    }

    return result
}


function swapFromCharacterToNumber(encodedDval, codebookForDecoding) {
    // Replace from char to number
    let decodedDval = []
    for (const char of encodedDval) {
        const decodedChar = codebookForDecoding.get(char)
        decodedDval.push(decodedChar)
    }
    return decodedDval
}
