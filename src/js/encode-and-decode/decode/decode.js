import { readUrlParamsAsMaps }    from 'common-utils/read-url-params'
import { relToAbs }               from 'decode/rel-to-abs'
import { absToRel }                   from 'enc-and-dec/lines-data/d-values/bigint64/abs-to-rel'
import { selectOutputTextareaId } from 'common-utils/select-output-textarea'
import { generateSvg }            from 'decode/generate-svg'
import { showProcessingTime }     from 'enc-and-dec/show-result'
import { bigint64Dec }            from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'
import { bruteforce53Dec }        from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-dec'
import { diffToRel }              from 'enc-and-dec/lines-data/d-values/bruteforce53/diff-to-rel'
import { swap63Dec }              from 'enc-and-dec/lines-data/d-values/swap63/swap63-dec'
import { outputToTextarea }       from 'common-utils/output-to-textarea'


// Decode to SVG string when page loaded.

// And also will be called from '/js/page-specific/index/tab-line/path-mode.js' when 'path-mode' changed via option selector.

export function decode(isRelative, isDataManipulatorPage) {
    const startTime = performance.now()
    console.log('Start the decoding SVG ...')

    const urlParamsAsTwoMaps = readUrlParamsAsMaps(isDataManipulatorPage)

    if (urlParamsAsTwoMaps != null) {

        // Extract the values
        const basicDataMap = urlParamsAsTwoMaps.basicData
        console.log("basicDataMap: ", basicDataMap)
        // Map(6) { title → "202404_001", viewbox → "0 0 31 31", viewboxWidth → "31", viewboxHeight → "31", uintN → 5, rectFill → "fff" }

        const linesDataMap = urlParamsAsTwoMaps.linesData
        console.log("linesDataMap: ", linesDataMap)
        // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
        // key  : Group ID (seq num)
        // value: Object
        //            groupColors  : Object {g_stroke: '#000000', g_opacity: 1, g_stroke_opacity: 1}
        //            {threeFlags  : Array(3)}
        //            {widthAndCounts  : Map(1)}
        //            {widthAndCounts  : Object { firstline: (4) […], lastline: (4) […], … }}
        //            {encodedDvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}


        const decodedAbsAndRelDvalsMaps = decodeDvals(linesDataMap)

        const decodedRelDvalsMap = decodedAbsAndRelDvalsMaps.get('relative')
        const decodedAbsDvalsMap = decodedAbsAndRelDvalsMaps.get('absolute')

        console.log("decodedRelDvalsMap: ", decodedRelDvalsMap) ///////////////////////////////////////////////
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

        console.log("decodedAbsDvalsMap: ", decodedAbsDvalsMap)
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

        const svgStr = generateSvg(isRelative, basicDataMap, linesDataMap, decodedRelDvalsMap, decodedAbsDvalsMap)

        // Output to textarea
        const outputTextareaId = selectOutputTextareaId(isRelative, isDataManipulatorPage)
        // console.log("outputTextareaId: ", outputTextareaId)
        // index.html: 'input-svg'
        // data-manipulator.html: 'textarea-decoded-svg-as-rel' | 'textarea-decoded-svg-as-abs'

        outputToTextarea(svgStr, outputTextareaId)


        // Compare the data size of url params and generated SVG
        const queryString = window.location.search;
        const compRatio = queryString.length / svgStr.length

        // Show the result in html
        const postfix = isRelative ? 'rel' : 'abs';
        const resultTextElem = document.getElementById(`encoded-size-compare-for-${postfix}`);
        if (resultTextElem) {
            const text = `Size of url params: <b>${queryString.length}</b> characters (bytes)<br>
        Size of SVG string: <b>${svgStr.length}</b> characters (bytes)<br>
        Ratio: ${queryString.length} / ${svgStr.length} = <b>${compRatio}</b>`
            resultTextElem.innerHTML = text
        }

        // Show the processing time in html and console
        const endTime = performance.now()
        const elapsedTime = Math.floor(endTime - startTime)
        showProcessingTime('SVG decoding', elapsedTime, `encoded-strokes-values-time-for-${postfix}`, isDataManipulatorPage)

        return svgStr

    } else {
        // Stop decoding when urlParamsAsTwoMaps = null
        console.log('There is no url params to decode.')

        if (isDataManipulatorPage === false) {
            console.log('Read a SVG string from input-svg textarea.')
            // <textarea>の要素を取得
            const svgTextarea = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...

            // <textarea>のvalue属性を取得
            const svgStr = svgTextarea.value.trim() // '.trim()' = 文字列の両端の空白を削除

            // Get textarea ID
            const outputTextareaId = selectOutputTextareaId(isRelative, isDataManipulatorPage)

            outputToTextarea(svgStr, outputTextareaId)
        }
    }

}



function decodeDvals(linesDataMap) {
    const decodedAbsDvalsMap = new Map()
    const decodedRelDvalsMap = new Map()

    for (const [gId, v] of linesDataMap) {
        // console.log("v.encodedDvals: ", v.encodedDvals) // "x1 + y1 + x2 + y2"
        // e.g.: H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w

        console.log("v.threeFlags: ", v.threeFlags) //

        let decodedAbsDvals = []
        let decodedRelDvals = []

        if (v.threeFlags[1] === '0') {
            console.log(`Group ${gId} has encoded with 'bruteforce53-enc'`)
            const decodedDiffDvals = bruteforce53Dec(v.encodedDvals, v.threeFlags)
            decodedRelDvals = decodedDiffDvals.map(column => diffToRel(column))
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthAndCounts)

        } else if (v.threeFlags[1] === '1') {
            console.log("This group has encoded with 'bigint64-enc'")
            decodedAbsDvals = bigint64Dec(v.encodedDvals, v.threeFlags)
            decodedRelDvals = absToRel(decodedAbsDvals, v.widthAndCounts)

        } else if (v.threeFlags[1] === '2') {
            console.log("This group has encoded with 'swap63-enc'")
            decodedRelDvals = swap63Dec(v.encodedDvals)
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthAndCounts)

        } else {
            console.log('Error! This group has unknown flag for encoding method.')
        }

        // Set into Map
        decodedAbsDvalsMap.set(
            gId, {
            x1: decodedAbsDvals[0],
            y1: decodedAbsDvals[1],
            x2: decodedAbsDvals[2],
            y2: decodedAbsDvals[3],
        })
        decodedRelDvalsMap.set(
            gId, {
            x1: decodedRelDvals[0],
            y1: decodedRelDvals[1],
            x2: decodedRelDvals[2],
            y2: decodedRelDvals[3],
        })

    }
    console.log('decodedAbsDvalsMap: ', decodedAbsDvalsMap)
    console.log('decodedRelDvalsMap: ', decodedRelDvalsMap)

    return new Map([
        ['absolute', decodedAbsDvalsMap],
        ['relative', decodedRelDvalsMap]
    ])
}
