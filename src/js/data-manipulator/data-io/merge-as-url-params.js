function mergeArtworkDataAndStrokesValues(){
    // Artwork Data encoded string from textarea
    const artworkDataStr = readTextarea(`textarea-artwork-data-encoded`)

    // Strokes Values encoded string from textarea
    const strokesValuesStr = readTextarea(`textarea-strokes-values-encoded`)

    // Merge
    const urlParamsStr = artworkDataStr + strokesValuesStr

    // Output to textarea
    outputToTextarea(urlParamsStr, `textarea-encoded-url-params`)

    // Show the result in html
    const resultText = document.getElementById(`encoded-url-params-size`)
    resultText.textContent  = `Encoded url params size: ${urlParamsStr.length} characters (bytes)`

    // Show the result in console
    console.log('Artwork Data and Strokes Values are merged as URL Params successfully, Size: ', urlParamsStr.length);
}
