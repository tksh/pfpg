function outputToTextarea(encodedText, textareaId) {
    const outputTextArea = document.querySelector(`#${textareaId}`);
    outputTextArea.value = encodedText
}