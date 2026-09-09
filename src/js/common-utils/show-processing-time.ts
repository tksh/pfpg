export function showProcessingTime(
  inputDataTitle: string,
  inputNum: number,
  outputElemId: string,
  isDataManipulatorPage: boolean,
): void {
  // Show the time in console
  console.log(`Processing time of ${inputDataTitle}: `, inputNum, " ms");

  // Show the time in html if on data-manipulator.html
  if (isDataManipulatorPage) {
    const outputTextElem = document.getElementById(`${outputElemId}`);
    if (outputTextElem === null) {
      throw new Error(`showProcessingTime: missing element #${outputElemId}`);
    }
    outputTextElem.textContent = `Processing time: ${inputNum} milliseconds`;
  }
}
