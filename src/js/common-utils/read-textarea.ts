export function readTextarea(textareaId: string): string {
  const textareaInput = document.querySelector(
    `#${textareaId}`,
  ) as HTMLTextAreaElement;
  //console.log('textareaInput: ', textareaInput)
  const textareaContent = textareaInput.value;
  //console.log('textareaContent: ', textareaContent)
  return textareaContent;
}
