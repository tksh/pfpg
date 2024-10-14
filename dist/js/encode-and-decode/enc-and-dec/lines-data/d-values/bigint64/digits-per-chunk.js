export function getDigitsPerChunk(uintN) {const maximumDValue = 2 ** uintN - 1
return String(maximumDValue).length}