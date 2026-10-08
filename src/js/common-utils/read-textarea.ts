export function readTextarea(textareaId: string): string {
  const textareaInput = document.querySelector(
    `#${textareaId}`,
  ) as HTMLTextAreaElement;
  const textareaContent = textareaInput.value;
  return textareaContent;
}
