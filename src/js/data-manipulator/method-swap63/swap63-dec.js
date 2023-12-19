function decodeSwap63(encodedDval, dictMapToDec) {
    // Replace from char to number
    let decodedDval = [];
    for (const char of encodedDval) {
        const decodedChar = dictMapToDec.get(char)
        decodedDval.push(decodedChar);
    }
    return decodedDval
}