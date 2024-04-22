// Decode from URL Params to SVG

// Get the SVG output textarea ID from URL for argument for decode()
// index: 'input-svg'
// data-manipulator: 'textarea-decoded-svg'

function isDataManipulatorOrIndex() {
    // 現在のURLを取得する
    const url = window.location.href;
    const target = 'data-manipulator'
    // url: 検索対象の文字列
    // target: 検索したい文字列
    return url.includes(target);
}
const isDataManipulatorOrIndexBool = isDataManipulatorOrIndex()

function getTextareaId(isDataManipulatorOrIndexBool) {
    if (isDataManipulatorOrIndexBool === true) { // data-manipulator.html
        return 'textarea-decoded-svg-as'
    } else {                              // index.html
        return 'input-svg'
    }
}
const svgOutputTextAreaId = getTextareaId(isDataManipulatorOrIndexBool)



decode(isRelOrAbsBool = false, isDataManipulatorOrIndexBool, svgOutputTextAreaId) // absolute and separated
decode(isRelOrAbsBool = true, isDataManipulatorOrIndexBool, svgOutputTextAreaId)  // relative and merged
// 'isDataManipulatorOrIndexBool = true' will export the generated svg into each textarea


function decode(isRelOrAbsBool, isDataManipulatorOrIndexBool, outputTextareaId) {
    const urlParamsAsTwoMaps = readUrlParamsAsMaps(isDataManipulatorOrIndexBool)

    if (urlParamsAsTwoMaps != null) {

        // Extract the values
        const artworkDataMap = urlParamsAsTwoMaps.artwork_data
        // console.log("artworkDataMap: ", artworkDataMap)
        // Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uint_n' => 5, 'bg_color' => '9999'}

        const strokesValuesMap = urlParamsAsTwoMaps.strokes_values
        // console.log("strokesValuesMap: ", strokesValuesMap)
        // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
        // key  : Group ID (seq num)
        // value: Object
        //            group_colors  : Object {g_stroke: '#000000', g_opacity: 1, g_stroke-opacity: 1}
        //            {three_flags  : Array(3)}
        //            {width_count  : Map(1)}
        //            {encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}


        const decodedAbsAndRelDvalsMaps = decodeStrokesValues(strokesValuesMap)

        const decodedRelDvalsMap = decodedAbsAndRelDvalsMaps.get('relative')
        const decodedAbsDvalsMap = decodedAbsAndRelDvalsMaps.get('absolute')

        //console.log("decodedRelDvalsMap: ", decodedRelDvalsMap)
        // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
        // [[Entries]]
        //     0: {1 => Object}
        //         key: 1
        //         value: x1: (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]
        //                x2: (19) [0, 0, -1, 4, 0, 4, 5, 1, 0, 0, 0, 3, 4, 2, -3, 0, 2, 8, 3]
        //                y1: (19) [0, -26, -25, -8, -1, -18, 0, -5, -9, -22, -25, 1, -7, -22, 2, -1, -1, -1, -19]
        //                y2: (19) [26, 25, 23, 6, 3, -5, 5, 24, 7, 25, 27, 3, -2, 9, 6, 4, 4, 5, 2]
        //     1: {2 => Object}
        //         key: 2
        // ...

        //console.log("decodedAbsDvalsMap: ", decodedAbsDvalsMap)
        // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
        // [[Entries]]
        //     0: {1 => Object}
        //         key: 1
        //         value:
        //             x1: (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]
        //             x2: (19) [1, 4, 6, 10, 8, 11, 24, 26, 24, 28, 30, 20, 8, 24, 23, 22, 24, 31, 26]
        //             y1: (19) [0, 0, 0, 15, 20, 5, 0, 0, 15, 0, 0, 28, 24, 0, 11, 16, 19, 22, 8]
        //             y2: (19) [26, 25, 23, 21, 23, 0, 5, 24, 22, 25, 27, 31, 22, 9, 17, 20, 23, 27, 10]
        //         [[Prototype]]: Object
        //     1: {2 => Object}
        //         key: 2
        // ...


        // Generate SVG string

        const svgStr = generateSvg(isRelOrAbsBool, artworkDataMap, strokesValuesMap, decodedRelDvalsMap, decodedAbsDvalsMap)

        // Output to textarea
        const specificOutputTextareaId = getSpecificOutputTextareaId(isRelOrAbsBool, isDataManipulatorOrIndexBool, outputTextareaId)
        // console.log("specificOutputTextareaId: ", specificOutputTextareaId)
        // index.html: 'input-svg'
        // data-manipulator.html: 'textarea-decoded-svg-as-rel' | 'textarea-decoded-svg-as-abs'

        outputToTextarea(svgStr, specificOutputTextareaId)


        // Compare the data size of URL params and generated SVG
        const queryString = window.location.search;
        const compRatio = queryString.length / svgStr.length

        // Show the result in html
        const resultTextElem = document.getElementById('encoded-size-compare');
        if (resultTextElem) {
            const text = `url params size: <b>${queryString.length}</b> characters (bytes)<br>
        decoded svg size: <b>${svgStr.length}</b> characters (bytes)<br>
        ${queryString.length} / ${svgStr.length} = <b>${compRatio}</b>`
            resultTextElem.innerHTML = text
        }

        return svgStr

    } else {
        // Stop decoding when urlParamsAsTwoMaps = null
        console.log('There is no url params to decode.')

        if (isDataManipulatorOrIndexBool === false) {
            console.log('Read a SVG string from input-svg textarea.')
            // <textarea>の要素を取得
            const svgElement = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...

            // <textarea>のvalue属性を取得
            const svgStr = svgElement.value.trim() // `.trim()` = 文字列の両端の空白を削除

            // Get textarea ID
            const specificOutputTextareaId = getSpecificOutputTextareaId(isRelOrAbsBool, isDataManipulatorOrIndexBool, outputTextareaId)

            outputToTextarea(svgStr, specificOutputTextareaId)
        }
    }

}



function decodeStrokesValues(strokesValuesMap) {
    const decodedAbsDvalsMap = new Map()
    const decodedRelDvalsMap = new Map()

    for ([groupId, v] of strokesValuesMap) {
        // console.log("v.encoded_dvals: ", v.encoded_dvals) // "x1 + y1 + x2 + y2"
        // H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w

        let decodedAbsDvals = []
        let decodedRelDvals = []

        if (v.three_flags[1] === '0') {
            console.log(`Group ${groupId} has encoded with 'bruteforce53-enc'`)
            decodedDiffDvals = decodeBruteforce53Enc(v.encoded_dvals, v.three_flags)
            decodedRelDvals = decodedDiffDvals.map(column => diffToRel(column))
            decodedAbsDvals = relToAbs(decodedRelDvals)

        } else if (v.three_flags[1] === '1') {
            console.log("This group has encoded with 'bigint64-enc'")
            decodedAbsAndRelDvalsObj = decodeBigint64Enc(v.encoded_dvals)
            decodedAbsDvals = decodedAbsAndRelDvalsObj.absolute
            decodedRelDvals = decodedAbsAndRelDvalsObj.relative

        } else if (v.three_flags[1] === '2') {
            console.log("This group has encoded with 'swap63-enc'")
            decodedRelDvals = decodeSwap63Enc(v.encoded_dvals)
            decodedAbsDvals = relToAbs(decodedRelDvals)

        } else {
            console.log('Error! This group has unknown flag for encoding method.')
        }

        // Set into Map
        decodedAbsDvalsMap.set(
            groupId, {
            x1: decodedAbsDvals[0],
            y1: decodedAbsDvals[1],
            x2: decodedAbsDvals[2],
            y2: decodedAbsDvals[3],
        })
        decodedRelDvalsMap.set(
            groupId, {
            x1: decodedRelDvals[0],
            y1: decodedRelDvals[1],
            x2: decodedRelDvals[2],
            y2: decodedRelDvals[3],
        })

    }
    //console.log('decodedAbsDvalsMap: ', decodedAbsDvalsMap)
    //console.log('decodedRelDvalsMap: ', decodedRelDvalsMap)

    return new Map([
        ['absolute', decodedAbsDvalsMap],
        ['relative', decodedRelDvalsMap]
    ])
}


function getSpecificOutputTextareaId(isRelOrAbsBool, isDataManipulatorOrIndexBool, outputTextareaId) {

    if (isDataManipulatorOrIndexBool === true) {          // page: data-manipulator.html
        if (isRelOrAbsBool === true) {                       // path style: relative
            return `${outputTextareaId}-rel`
        } else if (isRelOrAbsBool === false) {               // path style: absolute
            return `${outputTextareaId}-abs`
        }
    } else if (isDataManipulatorOrIndexBool === false) { // page: index.html
        return outputTextareaId
    }
}


