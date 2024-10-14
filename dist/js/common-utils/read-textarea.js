export function readTextarea(textareaId) {const textareaInput = document.querySelector(`#${textareaId}`)
const textareaContent = textareaInput.value
return textareaContent}