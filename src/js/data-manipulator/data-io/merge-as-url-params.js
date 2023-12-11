function mergeArtworkDataAndStrokesValues(){
    // Artwork Data encoded string from textarea
    const artworkDataStr = readTextarea(`textarea-artwork-data-encoded`)

    // Strokes Values encoded string from textarea
    const strokesValuesStr = readTextarea(`textarea-strokes-values-encoded`)

    // Merge
    const urlParamsStr = artworkDataStr + strokesValuesStr

    // Output to textarea
    outputToTextarea(urlParamsStr, `textarea-encoded-url-params`)

    // Show the size of result in html and console
    showStringSize('URL Params', urlParamsStr, 'encoded-url-params-size')
}
