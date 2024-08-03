export function getDigitsPerChunk(uintN) {
    const maximumDValue = 2 ** uintN - 1
    return String(maximumDValue).length
}
// Test
//console.log(getDigitsPerChunk(5))   // 2
//console.log(getDigitsPerChunk(6))   // 2
//console.log(getDigitsPerChunk(7))   // 3
//console.log(getDigitsPerChunk(8))   // 3
//console.log(getDigitsPerChunk(9))   // 3
//console.log(getDigitsPerChunk(10))  // 4
//console.log(getDigitsPerChunk(11))  // 4
//console.log(getDigitsPerChunk(12))  // 4
//console.log(getDigitsPerChunk(13))  // 4
//console.log(getDigitsPerChunk(14))  // 5