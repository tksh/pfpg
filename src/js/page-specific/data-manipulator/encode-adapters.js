import { BASIC_DATA_KEYS } from 'constants'
import { outputToTextarea } from 'common-utils/output-to-textarea'
import { readTextarea } from 'common-utils/read-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { showProcessingTime } from 'common-utils/show-processing-time'
import { showStringSize } from 'encode/show-result'
import { showBestMixResult } from 'encode/show-best-mix-result'
import { ENCODING_METHOD_FLAGS
       , bestMixEncode
       , defaultMethodsForUintN
       , encodeBasicData as encodeBasicDataWithCodec
       , encodeGroupColors
       , encodeGroupsBigint64
       , encodeGroupsBruteforce53
       , encodeGroupsFour16
       , encodeGroupsSwap63
       , encodeWidthsAndCounts
       , joinWithAmpersand
       , parseAggregatedLinesData
       , parseBasicData as parseBasicDataWithCodec
       , parseLinesData
       , tryDecompress } from '@tksh/stln-codec'

export
    { encodeBasicDataHandler
    , encodeBruteforce53Handler
    , encodeBigint64Handler
    , encodeSwap63Handler
    , encodeFour16Handler
    , encodeBestMixHandler
    , parseBasicDataFromTextarea
    , updateBasicDataKeysCheckboxStates
    , updateEncodingMethodsCheckboxStates
    }

// DOM-facing handlers for the data-manipulator encoding buttons.
// Pure codec work lives in stln-codec; this module only translates
// textareas/checkboxes to library inputs and results back to the page.

// Parse the basic-data JSON from its textarea (throws on invalid JSON).
function parseBasicDataFromTextarea() {
    return parseBasicDataWithCodec(JSON.parse(readTextarea('textarea-basic-data-uploaded')))
}

function getCheckedIncludes() {
    return Array.from(document.querySelectorAll('#basic-data-options input[type="checkbox"]:checked'))
        .map(cb => cb.id.replace('include-', ''))
}

function encodeBasicDataHandler() {
    const startTime = performance.now()
    const functionName = 'encodeBasicData()'

    const data = parseBasicDataFromTextarea()
    const dataAsUrlParams = encodeBasicDataWithCodec(data, { include: getCheckedIncludes() })

    outputToTextarea(dataAsUrlParams, 'textarea-basic-data-encoded')
    showStringSize(functionName, dataAsUrlParams, 'encoded-basic-data-size')

    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime(functionName, elapsedTime, 'encoded-basic-data-time', isOnDataManipulatorPage())
}

function updateBasicDataKeysCheckboxStates(basicData) {
    BASIC_DATA_KEYS.forEach(key => {
        if (key !== 'bits') {  // Skip 'bits' as it's always required
            const checkbox = document.getElementById(`include-${key}`)
            const label = checkbox.nextElementSibling

            if (!(key in basicData) || basicData[key] === '') {
                checkbox.checked = false
                checkbox.disabled = true
                label.textContent = `${key} (value not found in JSON)`
            } else {
                checkbox.checked = true
                checkbox.disabled = false
                label.textContent = key
            }
        }
    })
}

// Shared inputs for the lines-data method encoders.
async function getMethodEncodeArgs() {
    const basicData = parseBasicDataFromTextarea()
    const uintN = Number(await tryDecompress(basicData.bits))
    const lines = parseLinesData(JSON.parse(readTextarea('textarea-lines-data-uploaded')))
    const agg = parseAggregatedLinesData(JSON.parse(readTextarea('textarea-agg-data-for-comp-uploaded')))
    return {
        lines,
        agg,
        uintN,
        widthsAndCounts: encodeWidthsAndCounts(agg),
        groupColors: encodeGroupColors(lines),
    }
}

function showLinesDataResult(encodingMethodName, startTime, byGroups) {
    const joined = joinWithAmpersand(
        new Map([...byGroups].map(([gId, group]) => [gId, group.kvPair]))
    )
    outputToTextarea(joined, 'textarea-lines-data-encoded')
    showStringSize(`Lines Data encoding via '${encodingMethodName}Enc()'`, joined, 'encoded-lines-data-size')

    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime(`${encodingMethodName}Enc()`, elapsedTime, 'encoded-lines-data-time', isOnDataManipulatorPage())
}

async function encodeBruteforce53Handler() {
    const startTime = performance.now()
    showLinesDataResult('bruteforce53', startTime, await encodeGroupsBruteforce53(await getMethodEncodeArgs()))
}

async function encodeBigint64Handler() {
    const startTime = performance.now()
    showLinesDataResult('bigint64', startTime, await encodeGroupsBigint64(await getMethodEncodeArgs()))
}

async function encodeSwap63Handler() {
    const startTime = performance.now()
    showLinesDataResult('swap63', startTime, await encodeGroupsSwap63(await getMethodEncodeArgs()))
}

async function encodeFour16Handler() {
    const startTime = performance.now()
    showLinesDataResult('four16', startTime, await encodeGroupsFour16(await getMethodEncodeArgs()))
}

// Method ids in legacy ENCODING_METHODS order (also the tie-break order).
const ENCODING_IDS = ['bruteforce53', 'bigint64', 'swap63', 'four16']

function getCheckedEncodingMethodNames() {
    return ENCODING_IDS
        .filter(id => document.getElementById(`apply-${id}`).checked)
}

async function encodeBestMixHandler() {
    const checkedMethodNames = getCheckedEncodingMethodNames()
    const args = await getMethodEncodeArgs()
    const { params: shortestJoined, byGroup: shortestByGroups } =
        await bestMixEncode(args, checkedMethodNames)

    outputToTextarea(shortestJoined, 'textarea-lines-data-encoded')
    const inputDataTitle = `Lines Data encoding via 'bestMixEnc()' includes ${checkedMethodNames.join(', ')}`
    showStringSize(inputDataTitle, shortestJoined, 'encoded-lines-data-size')
    showBestMixResult(detailsByGroups(shortestByGroups), 'encoded-lines-data-size')
    // Clear the processing time display
    document.getElementById('encoded-lines-data-time').innerHTML = ''
}

// Per-group table for showBestMixResult, shaped like the legacy
// showDetailsByGroups() output (parallel arrays per attribute).
function detailsByGroups(byGroups) {
    const keys = [...byGroups.keys()]
    const kvPairs = [...byGroups.values()].map(group => group.kvPair)
    const methods = [...byGroups.values()].map(group => group.method)
    return new Map([
        ['gId', keys],
        ['colors', kvPairs.map(kvPair => kvPair.split('=')[0])],
        ['length', kvPairs.map(kvPair => kvPair.length)],
        ['flags', kvPairs.map(kvPair => kvPair.split('=')[1])],
        ['flag1', kvPairs.map(kvPair => kvPair.split('=')[1][0])],
        ['flag2', methods.map(method => ENCODING_METHOD_FLAGS[method])],
    ])
}

// Checkboxes to enable each encoding method (gated by grid size).
async function updateEncodingMethodsCheckboxStates(basicData) {
    const uintN = Number(await tryDecompress(basicData.bits))
    const available = defaultMethodsForUintN(uintN)

    for (const id of ENCODING_IDS) {
        const checkbox = document.getElementById(`apply-${id}`)
        const enabled = available.includes(id)
        checkbox.checked = enabled
        checkbox.disabled = !enabled
    }
}
