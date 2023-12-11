function showStringSize(nameOfInput, inputStr, outputElemId) {
    // Show the size in html
    const outputText = document.getElementById(`${outputElemId}`)
    outputText.textContent = `Encoded ${nameOfInput} size: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Encoded as ${nameOfInput} successfully, Size: `, inputStr.length);
}

function showProcessingTime(nameOfInput, inputNum, outputElemId) {
    // Show the time in html
    const outputText = document.getElementById(`${outputElemId}`)
    outputText.textContent = `Processing time of ${nameOfInput}: ${inputNum} milliseconds`

    // Show the time in console
    console.log(`Processing time of ${nameOfInput}: `, inputNum, ' ms');
}