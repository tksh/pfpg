export function setupCopyButtons(): void {
  document.querySelectorAll(".copy-button").forEach((button: Element) => {
    button.addEventListener("click", function (this: Element): void {
      const textareaId = this.getAttribute("data-textarea-id");
      if (textareaId === null) {
        throw new Error("setupCopyButtons: missing data-textarea-id");
      }
      const textareaElem = document.getElementById(textareaId);
      if (textareaElem === null) {
        throw new Error(`setupCopyButtons: missing element #${textareaId}`);
      }
      const textarea = textareaElem as HTMLTextAreaElement;
      const textToCopy = textarea.value;
      const originalText = this.textContent;

      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          if (textToCopy.length === 0) {
            console.log("There is no text to copy.");
            this.textContent = "❌ There is no text to copy";
            setTimeout(() => {
              this.textContent = originalText;
            }, 3000);
          } else {
            console.log("Text copied to clipboard successfully.");
            this.textContent = "✔️ Successfully copied!";
            setTimeout(() => {
              this.textContent = originalText;
            }, 1500);
          }
        })
        .catch((error) => {
          console.error("Error copying text to clipboard:", error);
        });
    });
  });
}
