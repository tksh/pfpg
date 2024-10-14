export function setupCopyButtons() {document.querySelectorAll('.copy-button').forEach(button => {button.addEventListener('click', function() {const textareaId = this.getAttribute('data-textarea-id')
const textarea = document.getElementById(textareaId)
const textToCopy = textarea.value
const originalText = this.textContent
navigator.clipboard.writeText(textToCopy)
.then(() => {if (textToCopy.length === 0) {this.textContent = '❌ There is no text to copy'
setTimeout(() => {this.textContent = originalText}, 3000)} else {this.textContent = '✔️ Successfully copied !'
setTimeout(() => {this.textContent = originalText}, 1500)}})
.catch((error) => {console.error('Error copying text to clipboard:', error)})})})}