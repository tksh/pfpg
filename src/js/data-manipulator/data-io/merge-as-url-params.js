function mergeBasicDataAndStrokesValues(){
    // Basic Data encoded string from textarea
    const basicDataStr = readTextarea(`textarea-basic-data-encoded`)

    // Lines Data encoded string from textarea
    const strokesValuesStr = readTextarea(`textarea-strokes-values-encoded`)

    // Merge
    const urlParamsStr = basicDataStr + strokesValuesStr

    // Output to textarea
    outputToTextarea(urlParamsStr, `textarea-encoded-url-params`)

    // Show the size of result in html and console
    showStringSize('URL Params', urlParamsStr, 'encoded-url-params-size')
}
