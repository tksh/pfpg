function divideStringEqually(str, numberOfParts) {
    const totalLength = str.length;
    const lengthPerPart = Math.ceil(totalLength / numberOfParts);
    const result = [];

    for (let i = 0; i < totalLength; i += lengthPerPart) {
        result.push(str.slice(i, i + lengthPerPart));
    }

    return result;
}