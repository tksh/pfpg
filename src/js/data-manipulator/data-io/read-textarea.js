function readTextarea(textareaId) {
    const textareaInput = document.querySelector(`#${textareaId}`)
    //console.log('textareaInput: ', textareaInput)
    const textareaContent = textareaInput.value
    //console.log('textareaContent: ', textareaContent)
    return textareaContent
}