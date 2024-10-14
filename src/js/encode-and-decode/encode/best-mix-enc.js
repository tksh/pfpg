/**
 * Module for encoding and processing data using various methods.
 * This module provides functionality to encode data using different methods,
 * compare the results, and display the best mix of encoding methods.
 */

import { outputToTextarea }  from 'common-utils/output-to-textarea'
import { tryDecompress }     from 'decode/try-decompress'
import { showDetailsByGroups
       , showStringSize}     from 'encode/show-result'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { showBestMixResult } from 'encode/show-best-mix-result'
import { simplifyMap }       from 'encode/simplify-map'
import { storeShortest }     from 'encode/store-shortest'
import { bigint64Enc }       from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { bruteforce53Enc }   from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { swap63Enc }         from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'
import { four16Enc }         from 'enc-and-dec/lines-data/d-values/four16/four16-enc'

export
    { bestMixEnc
    , updateEncodingMethodsCheckboxStates
    }


/**
 * Object containing all available encoding methods.
 * Each method is a function that returns a Map of encoded data.
 */
const ENCODING_METHODS = {
    bruteforce53: bruteforce53Enc,
    bigint64    : bigint64Enc,
    swap63      : swap63Enc,
    four16      : four16Enc,
}

/**
 * Retrieves the names of encoding methods
 */
function getCheckedEncodingMethodNames() {
    return Object.keys(ENCODING_METHODS)
        .filter(id => document.getElementById(`apply-${id}`).checked)
        .map(id => id.replace('apply-', ''))
}

/**
 * Applies each encoding method to the data asynchronously.
 * @param   {Array<Function>} methods - An array of encoding method functions.
 * @returns {Promise<Array<Map>>} A promise that resolves to an array of Maps containing the encoded data from each method.
 */
async function encodeWithSelectedMethods(methods) {
    // Wait for all methods to complete and resolve their Promises
    return await Promise.all(methods.map((method) => method()))
}

/**
 * Processes the encoded data to find the shortest encoding for each group.
 * @param   {Array<Map>} encodedMaps - An array of Maps containing encoded data.
 * @param   {Array<string>} methodNames - An array of encoding method names.
 * @returns {Array} An array containing the shortest encoded data and its associated information.
 */
function processEncodedData(encodedMaps, methodNames) {
    const shortestArrByGroups = storeShortest(encodedMaps, methodNames)
    const shortestStrByGroups = simplifyMap(shortestArrByGroups)
    const shortestStrArr = [...shortestStrByGroups.values()]
    return [shortestArrByGroups, shortestStrArr]
}

/**
 * Displays the results of the encoding process.
 * @param {string} shortestJoined - The joined string of the shortest encodings.
 * @param {Map} shortestArrByGroups - A Map containing the shortest encodings by group.
 * @param {number} numberOfMethods - The number of encoding methods used.
 */
function displayResults(shortestJoined, shortestArrByGroups, checkedMethodNames) {
    outputToTextarea(shortestJoined, 'textarea-lines-data-encoded')
    const inputDataTitle = `Lines Data encoding via 'bestMixEnc()' includes ${checkedMethodNames.join(', ')}`
    showStringSize(inputDataTitle, shortestJoined, 'encoded-lines-data-size')
    const dataToShow = showDetailsByGroups(shortestArrByGroups, 'best-mix')
    showBestMixResult(dataToShow, 'encoded-lines-data-size')
    // Clear the processing time display
    document.getElementById('encoded-lines-data-time').innerHTML = ''
}

/**
 * Performs the best mix encoding process using the specified methods.
 */
async function bestMixEnc() {
    // Get the methods checked
    const checkedMethodNames = getCheckedEncodingMethodNames()  // e.g.: (3) ['bruteforce53', 'swap63', 'four16']
    const checkedMethodFunctions = checkedMethodNames.map((name) => ENCODING_METHODS[name])  // e.g.: (3) [ƒ, ƒ, ƒ]
    // Encode and choose the best result by groups
    const encodedMaps = await encodeWithSelectedMethods(checkedMethodFunctions)
    const [shortestArrByGroups, shortestStrArr] = processEncodedData(encodedMaps, checkedMethodNames)
    const shortestJoined = joinWithAmpersand(shortestStrArr)
    // Show the results
    displayResults(shortestJoined, shortestArrByGroups, checkedMethodNames)
}



// Checkboxes to enable each encoding methods

function updateEncodingMethodsCheckboxStates(basicData) {
    const uintN = tryDecompress(basicData.n)
    const checkboxes = Object.keys(ENCODING_METHODS).reduce((acc, id) => {
        acc[id] = document.getElementById(`apply-${id}`)
        return acc
    }, {})

    const settings = {
        bruteforce53: { checked: true, disabled: false },
        bigint64: { checked: true, disabled: false },
        swap63: { checked: uintN <= 5, disabled: uintN > 5 },
        four16: { checked: uintN <= 8, disabled: uintN > 8 }
    }

    Object.entries(settings).forEach(([id, state]) => {
        Object.assign(checkboxes[id], state)
    })
}
