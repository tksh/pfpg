// For mono method [bruteforce53|bigint64|swap63] encoding
export function outputToTextarea(encodedText, textareaId) {
    const outputTextArea = document.getElementById(textareaId);
    console.log('outputTextArea: ', outputTextArea)
    outputTextArea.value = encodedText
}
