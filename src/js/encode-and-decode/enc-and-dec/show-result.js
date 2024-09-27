export function showProcessingTime(inputName, inputNum, outputElemId, isDataManipulatorPage) {
    // Show the time in console
    console.log(`Processing time of ${inputName}: `, inputNum, ' ms')

    // Show the time in html if on data-manipulator.html
    if (isDataManipulatorPage) {
        const outputTextElem = document.getElementById(`${outputElemId}`)
        outputTextElem.textContent = `Processing time of ${inputName}: ${inputNum} milliseconds`
    }
}
