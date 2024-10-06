import { outputToTextarea }       from 'common-utils/output-to-textarea'
import { decodeUrlParams }        from 'common-utils/read-url-params'
import { selectOutputTextareaId } from 'common-utils/select-output-textarea'
import { calculateArtworkId }     from 'decode/calc-artwork-id'
import { relToAbs }               from 'decode/rel-to-abs'
import { generateSvg }            from 'decode/generate-svg'
import { showProcessingTime }     from 'common-utils/show-processing-time'
import { absToRel }               from 'enc-and-dec/lines-data/d-values/bigint64/abs-to-rel'
import { bigint64Dec }            from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'
import { bruteforce53Dec }        from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-dec'
import { diffToRel }              from 'enc-and-dec/lines-data/d-values/bruteforce53/diff-to-rel'
import { four16Dec }              from 'enc-and-dec/lines-data/d-values/four16/four16-dec'
import { swap63Dec }              from 'enc-and-dec/lines-data/d-values/swap63/swap63-dec'


export
    { decodeUrlToSvg
    , decodeDvals
    }

// Decode to SVG string when page loaded.

// And also will be called from '/js/page-specific/index/tab-lines/path-mode.js' when 'path-mode' changed via option selector.

function decodeUrlToSvg(isRelative, isDataManipulatorPage) {
    const startTime = performance.now()
    console.log(`Start the decoding from URL params to SVG (isRelative = ${isRelative}) ...`)

    const decodedParams = decodeUrlParams()
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
        //   widthsAndCounts: decodedWidthsAndCountsMap,
        //   encodedDvals:   encodedDvalsStr,
        //   relDvalsObj:    decodedRelDvalsObj,
        //   absDvalsObj:    decodedAbsDvalsObj

        console.log("decodedParams.sizeData: ", decodedParams.sizeData)
        // e.g.:
        // {viewbox: '0 0 127 127', uintN: 7, width: 127, height: 127}


        // Uncomment to get the artwork ID
        // // Calculate the artwork ID from absolute lines data
        // const artworkId = await calculateArtworkId(decodedParams.linesData)
        // console.log("artworkId.hexHash: ", artworkId.hexHash)
        // console.log("artworkId.bech32Hash: ", artworkId.bech32Hash)
        // console.log("artworkId.bech32mHash: ", artworkId.bech32mHash)
        // // e.g.: (202401_001)
        // // hexHash:     "9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755" (64 chars)
        // // bech32Hash:  "uinp1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs"  (63 chars)
        // // bech32mHash: "uinp1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2sk8xjjj"  (63 chars)


        // Generate SVG string

        const svgString = generateSvg(isRelative, decodedParams)

        // Output to textarea
        const outputTextareaId = selectOutputTextareaId(isRelative, isDataManipulatorPage)
        // console.log("outputTextareaId: ", outputTextareaId)
        // index.html: 'svg-string'
        // data-manipulator.html: 'textarea-decoded-svg-as-rel' | 'textarea-decoded-svg-as-abs'

        outputToTextarea(svgString, outputTextareaId)


        // Compare the data size of url params and generated SVG
        const queryString = window.location.search
        const compRatio = queryString.length / svgString.length

        // Show the result in html
        const postfix = isRelative ? 'rel' : 'abs'

        // When at data-manipulator.html
        if (isDataManipulatorPage) {
            const resultTextElem = document.getElementById(`encoded-size-compare-for-${postfix}`)
            const text = `Size of url params: <b>${queryString.length}</b> characters (bytes)<br>
        Size of SVG string: <b>${svgString.length}</b> characters (bytes)<br>
        Ratio: ${queryString.length} / ${svgString.length} = <b>${compRatio}</b>`
            resultTextElem.innerHTML = text
        }

        // Show the processing time in html and console
        const endTime = performance.now()
        const elapsedTime = Math.floor(endTime - startTime)
        showProcessingTime('SVG decoding', elapsedTime, `encoded-lines-data-time-for-${postfix}`, isDataManipulatorPage)

        return svgString

    } else {  // (decodedParams = null)

        // Stop decoding when there is no url params to decode.
        // - This process possible to happen only at "data-manipulator.html",
        // - because if there is  no url params at "index.html",
        // - alternative text content like url params has read already.
        console.log('There is no url params to decode.')

    }
}


function decodeDvals(linesDataMap) {

    let decodedAbsDvalsObj = {}
    let decodedRelDvalsObj = {}

    for (const [gId, v] of linesDataMap) {
        console.log("gId: ", gId)  // 0, 1, 2 ...
        console.log("v: ", v)      // {groupColors: {…}, encodingMethodFlag: '0', widthsAndCounts: {…}, relDvalsObj: Map(1), absDvalsObj: Map(1)}

        console.log("v.encodedDvals: ", v.encodedDvals) // Encoded string:  x1 + y1 + x2 + y2
        // e.g.: H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w
        console.log("v.encodingMethodFlag: ", v.encodingMethodFlag)  // e.g.: 0

        let decodedAbsDvals = []
        let decodedRelDvals = []

        if (v.encodingMethodFlag === '0') {
            console.log(`Group ${gId} has encoded with 'bruteforce53-enc'`)
            const decodedDiffDvals = bruteforce53Dec(v.encodedDvals)
            decodedRelDvals = decodedDiffDvals.map(coord => diffToRel(coord))
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)

        } else if (v.encodingMethodFlag === '1') {
            console.log("This group has encoded with 'bigint64-enc'")
            decodedAbsDvals = bigint64Dec(v.encodedDvals)
            decodedRelDvals = absToRel(decodedAbsDvals, v.widthsAndCounts)

        } else if (v.encodingMethodFlag === '2') {
            console.log("This group has encoded with 'swap63-enc'")
            decodedRelDvals = swap63Dec(v.encodedDvals)
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)

        } else if (v.encodingMethodFlag === '3') {
            console.log("This group has encoded with 'four16-enc'")
            decodedRelDvals = four16Dec(v.encodedDvals)
            decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)

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
