export { showStringSize };

function showStringSize(
  inputDataTitle: string,
  inputStr: string,
  outputElemId: string,
): void {
  // Show the size in html
  const outputTextElem = document.getElementById(`${outputElemId}`);
  if (outputTextElem === null) {
    throw new Error(`showStringSize: missing element #${outputElemId}`);
  }
  outputTextElem.textContent =
    `Result length of ${inputDataTitle}: ${inputStr.length} characters (bytes)`;
}
