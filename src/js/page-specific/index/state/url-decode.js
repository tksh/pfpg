import { decodeUrlParams
       , decodeUrlToSvg as decodeWithCodec } from '@tksh/stln-codec'
import { outputToTextarea } from 'common-utils/output-to-textarea'
import { getUrlParamsExceptsStates } from 'common-utils/read-url-params'
import { showProcessingTime } from 'common-utils/show-processing-time'

export
    { decodeUrlToSvgForPage
    , getDecodedLinesData
    , getDecodedSizeData
    }

// Decode artwork URL params (UI state keys filtered out) to an SVG string
// via stln-codec, preserving the previous index-page side effects:
// textarea output and console timing. Pure decode lives in the library.

async function decodeUrlToSvgForPage(isRelative) {
    const startTime = performance.now()
    console.log(`Start the decoding from URL params to SVG (isRelative = ${isRelative}) ...`)

    const params = getUrlParamsExceptsStates()
    if (params.toString() === '') {
        console.log('There is no url params to decode.')
        return
    }

    const pathMode = isRelative ? 'relativeMerged' : 'absoluteSeparated'
    const { svg: svgString } = await decodeWithCodec(getUrlParamsExceptsStates(), { pathMode })
    outputToTextarea(svgString, 'svg-string')

    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('SVG decoding', elapsedTime, '', false)

    return svgString
}

// Decoded line groups for UI that derives settings from artwork data.
async function getDecodedLinesData() {
    return (await decodeUrlParams(getUrlParamsExceptsStates())).linesData
}

// Decoded canvas size for UI that restores the original viewBox.
async function getDecodedSizeData() {
    return (await decodeUrlParams(getUrlParamsExceptsStates())).sizeData
}
