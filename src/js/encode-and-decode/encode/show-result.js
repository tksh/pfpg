export
    { showStringSize
    }

function showStringSize(inputDataTitle, inputStr, outputElemId) {
    console.log(`//////////////////////// Result: ${inputDataTitle} ////////////////////////`)

    // Show the size in html
    const outputTextElem = document.getElementById(`${outputElemId}`)
    outputTextElem.textContent = `Result length of ${inputDataTitle}: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Length of encoded string via: `, inputStr.length)
}
