function outputToTextarea(encodedText, textareaId) {
    // const outputTextArea = document.querySelector(`#${textareaId}`);
    const outputTextArea = document.getElementById(`${textareaId}`);
    console.log('outputTextArea: ', outputTextArea)
    outputTextArea.value = encodedText
    // outputTextArea.textContent = encodedText
}