function divideStringEqually(str, numberOfParts) {
    const totalLength = str.length;
    const lengthPerPart = Math.ceil(totalLength / numberOfParts);
    const result = [];

    for (let i = 0; i < totalLength; i += lengthPerPart) {
        result.push(str.slice(i, i + lengthPerPart));
    }

    return result;
}


function decodeSwap63(encodedDval, dictMapToDec) {
    // Replace from char to number
    let decodedDval = [];
    for (const char of encodedDval) {
        const decodedChar = dictMapToDec.get(char)
        decodedDval.push(decodedChar);
    }
    return decodedDval
}
