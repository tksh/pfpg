function outputToTextarea(encodedText, textareaId) {
    const outputTextArea = document.getElementById(`${textareaId}`);
    console.log('outputTextArea: ', outputTextArea)
    outputTextArea.value = encodedText
}
