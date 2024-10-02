export function showProcessingTime(inputDataTitle, inputNum, outputElemId, isDataManipulatorPage) {
    // Show the time in console
    console.log(`Processing time of ${inputDataTitle}: `, inputNum, ' ms')

    // Show the time in html if on data-manipulator.html
    if (isDataManipulatorPage) {
        const outputTextElem = document.getElementById(`${outputElemId}`)
        outputTextElem.textContent = `Processing time: ${inputNum} milliseconds`
    }
}
