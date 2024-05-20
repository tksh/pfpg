function outputToTextarea(encodedText, textareaId) {
    const outputTextArea = document.getElementById(`${textareaId}`);
    console.log('outputTextArea: ', outputTextArea)
    outputTextArea.value = encodedText
}


function selectOutputTextareaId(isRelative, isDataManipulatorPage) {

    if (isDataManipulatorPage === true) {          // on: data-manipulator.html
        if (isRelative === true) {                 //      path style: relative
            return 'textarea-decoded-svg-as-rel'
        } else if (isRelative === false) {         //      path style: absolute
            return 'textarea-decoded-svg-as-abs'
        }
    } else if (isDataManipulatorPage === false) {  // on: index.html
        return 'input-svg'
    }

}