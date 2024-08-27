import { outputToTextarea }       from 'common-utils/output-to-textarea'
import { decodeUrlParams }        from 'common-utils/read-url-params'
import { selectOutputTextareaId } from 'common-utils/select-output-textarea'
import { relToAbs }               from 'decode/rel-to-abs'
import { generateSvg }            from 'decode/generate-svg'
import { showProcessingTime }     from 'enc-and-dec/show-result'
import { absToRel }               from 'enc-and-dec/lines-data/d-values/bigint64/abs-to-rel'
import { bigint64Dec }            from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'
import { bruteforce53Dec }        from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-dec'
import { diffToRel }              from 'enc-and-dec/lines-data/d-values/bruteforce53/diff-to-rel'
import { swap63Dec }              from 'enc-and-dec/lines-data/d-values/swap63/swap63-dec'


export
    { decode
    , decodeDvals
    }

// Decode to SVG string when page loaded.

// And also will be called from '/js/page-specific/index/tab-lines/path-mode.js' when 'path-mode' changed via option selector.

function decode(isRelative, isDataManipulatorPage) {
    const startTime = performance.now()
    console.log('Start the decoding SVG ...')

    const decodedParams = decodeUrlParams(isDataManipulatorPage)
    // return { basicData: basicDataObj, linesData: linesDataMap, sizeData: sizeDataObj }

    if (decodedParams != null) {

        // decodedParams has three data like:

        console.log("decodedParams.basicData: ", decodedParams.basicData)
        // e.g.: {title: '202401_001', desc: 'Portrait of a woman'}

        console.log("decodedParams.linesData: ", decodedParams.linesData)
        // e.g.:
        // Map() {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
        //   key  : Group ID (seq num start at 0)
        //   value: Object
        //   groupColors:    decodedGroupColorsObj,
        //   twoCharFlags:   decodedEncodingMethodFlagChar,
        //   widthAndCounts: decodedWidthAndCountsMap,
        //   encodedDvals:   encodedDvalsStr,
        //   relDvalsObj:    decodedRelDvalsObj,
        //   absDvalsObj:    decodedAbsDvalsObj

        console.log("decodedParams.sizeData: ", decodedParams.sizeData)
        // e.g.:
        // {viewbox: '0 0 127 127', uintN: 7, width: 127, height: 127}


        // Generate SVG string

        const svgStr = generateSvg(isRelative, decodedParams)
        // const svgStr = generateSvg(isRelative, basicDataObj, linesDataMap, relDvalsObj, absDvalsObj)

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
        // Stop decoding when decodedParams = null
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
    console.log("||||linesDataMap: ", linesDataMap)
    let decodedAbsDvalsObj = {}
    let decodedRelDvalsObj = {}

    for (const [gId, v] of linesDataMap) {
        console.log("gId: ", gId)  // 0, 1, 2 ...
        console.log("v: ", v)      // {groupColors: {…}, encodingMethodFlag: '0', widthAndCounts: {…}, relDvalsObj: Map(1), absDvalsObj: Map(1)}

        console.log("v.encodedDvals: ", v.encodedDvals) // Encoded string:  x1 + y1 + x2 + y2
        // e.g.: H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w
        console.log("v.encodingMethodFlag: ", v.encodingMethodFlag)
        // 

        let decodedAbsDvals = []
        let decodedRelDvals = []

        if (v.encodingMethodFlag === '0') {
            console.log(`Group ${gId} has encoded with 'bruteforce53-enc'`)
            const decodedDiffDvals = bruteforce53Dec(v.encodedDvals)
            decodedRelDvals = decodedDiffDvals.map(column => diffToRel(column))
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthAndCounts)

        } else if (v.encodingMethodFlag === '1') {
            console.log("This group has encoded with 'bigint64-enc'")
            decodedAbsDvals = bigint64Dec(v.encodedDvals)
            decodedRelDvals = absToRel(decodedAbsDvals, v.widthAndCounts)

        } else if (v.encodingMethodFlag === '2') {
            console.log("This group has encoded with 'swap63-enc'")
            decodedRelDvals = swap63Dec(v.encodedDvals)
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthAndCounts)

        } else {
            console.log('Error! This group has unknown flag for encoding method.')
        }

        // Set into Object
        decodedAbsDvalsObj = {
            x1: decodedAbsDvals[0],
            y1: decodedAbsDvals[1],
            x2: decodedAbsDvals[2],
            y2: decodedAbsDvals[3]
        }
        decodedRelDvalsObj = {
            x1: decodedRelDvals[0],
            y1: decodedRelDvals[1],
            x2: decodedRelDvals[2],
            y2: decodedRelDvals[3]
        }
    }

    console.log('decodedAbsDvalsObj: ', decodedAbsDvalsObj)
    console.log('decodedRelDvalsObj: ', decodedRelDvalsObj)

    return {
        absolute: decodedAbsDvalsObj,
        relative: decodedRelDvalsObj
    }
}
