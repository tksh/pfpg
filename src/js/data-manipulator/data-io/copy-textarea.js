function copyTextarea(textareaId) {
  const textarea = document.getElementById(textareaId);
  const textToCopy = textarea.value;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      console.log('Text copied to clipboard successfully.');
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
}