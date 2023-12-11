function showStringSize(nameOfInput, inputStr, outputElemId) {
    // Show the size in html
    const outputText = document.getElementById(`${outputElemId}`)
    outputText.textContent = `Encoded ${nameOfInput} size: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Encoded as ${nameOfInput} successfully, Size: `, inputStr.length);
}