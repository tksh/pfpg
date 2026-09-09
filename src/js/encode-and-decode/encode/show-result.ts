export { showStringSize };

function showStringSize(
  inputDataTitle: string,
  inputStr: string,
  outputElemId: string,
): void {
  console.log(
    `//////////////////////// Result: ${inputDataTitle} ////////////////////////`,
  );

  // Show the size in html
  const outputTextElem = document.getElementById(`${outputElemId}`);
  if (outputTextElem === null) {
    throw new Error(`showStringSize: missing element #${outputElemId}`);
  }
  outputTextElem.textContent =
    `Result length of ${inputDataTitle}: ${inputStr.length} characters (bytes)`;

  // Show the size in console
  console.log(`Length of encoded string via: `, inputStr.length);
}
