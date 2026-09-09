// For mono method [bruteforce53|bigint64|swap63] encoding
export function outputToTextarea(encodedText: string, textareaId: string): void {
    const outputTextArea = document.getElementById(textareaId) as HTMLTextAreaElement
    outputTextArea.value = encodedText
}
