export function copyTextarea(textareaId, buttonId) {
  const textarea = document.getElementById(textareaId);
  const textToCopy = textarea.value;

  const button = document.getElementById(buttonId);
  const originalText = button.textContent; // Store the original text in a variable


  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      if (textToCopy.length === 0) {
        console.log('There is no text to copy.');
        button.textContent = '❌ There is no text to copy'
        // After some time, revert to the original text
        setTimeout(() => {
          button.textContent = originalText;
        }, 3000);
      } else {
        console.log('Text copied to clipboard successfully.');
        button.textContent = '✔️ Successfully copied !'
        // After some time, revert to the original text
        setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      }
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
}