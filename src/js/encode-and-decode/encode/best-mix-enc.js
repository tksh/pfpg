/**
 * Module for encoding and processing data using various methods.
 * This module provides functionality to encode data using different methods,
 * compare the results, and display the best mix of encoding methods.
 */

import { outputToTextarea }  from 'common-utils/output-to-textarea'
import { flagsMap }          from 'constants'
import { showDetailsByGroups
       , showStringSize}     from 'encode/show-result'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { showBestMixResult } from 'encode/show-best-mix-result'
import { simplifyMap }       from 'encode/simplify-map'
import { storeShortest }     from 'encode/store-shortest'
import { bigint64Enc }       from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { bruteforce53Enc }   from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { swap63Enc }         from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'

/**
 * Object containing all available encoding methods.
 * Each method is a function that returns a Map of encoded data.
 */
const ENCODING_METHODS = {
    bruteforce53: bruteforce53Enc,
    bigint64    : bigint64Enc,
    swap63      : swap63Enc,
}

/**
 * Retrieves a subset of encoding methods based on the specified number.
 * @param   {number} numberOfMethods - The number of encoding methods to retrieve.
 * @returns {Array<Function>} An array of encoding method functions.
 */
function getEncodingMethods (numberOfMethods) {
    const methods = ["bruteforce53", "bigint64", "swap63"].slice(0, numberOfMethods)
    return methods.map((method) => ENCODING_METHODS[method])
}

/**
 * Retrieves the names of encoding methods based on the specified number.
 * @param   {number} numberOfMethods - The number of encoding method names to retrieve.
 * @returns {Array<string>} An array of encoding method names.
 */
function getEncodingMethodNames (numberOfMethods) {
    return Array.from(flagsMap.get("2nd").keys()).slice(0, numberOfMethods)
}

/**
 * Applies each encoding method to the data.
 * @param   {Array<Function>} methods - An array of encoding method functions.
 * @returns {Array<Map>} An array of Maps containing the encoded data from each method.
 */
function encodeWithMethods (methods) {
    return methods.map((method) => method())
}

/**
 * Processes the encoded data to find the shortest encoding for each group.
 * @param   {Array<Map>} encodedMaps - An array of Maps containing encoded data.
 * @param   {Array<string>} methodNames - An array of encoding method names.
 * @returns {Array} An array containing the shortest encoded data and its associated information.
 */
function processEncodedData (encodedMaps, methodNames) {
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
function displayResults (shortestJoined, shortestArrByGroups, numberOfMethods) {
    outputToTextarea(shortestJoined, "textarea-lines-data-encoded")
    const messagePrefix = `Lines Data (Best mix from ${numberOfMethods} methods)`
    showStringSize(messagePrefix, shortestJoined, "encoded-strokes-values-size")
    const dataToShow = showDetailsByGroups("Lines Data", shortestArrByGroups, "best-mix")
    showBestMixResult(dataToShow, "encoded-strokes-values-size")
    // Clear the processing time display
    document.getElementById("encoded-strokes-values-time").innerHTML = ""
}

/**
 * Performs the best mix encoding process using the specified number of methods.
 * @param {number} numberOfMethods - The number of encoding methods to use.
 */
function bestMixFromNMethods(numberOfMethods) {
    const methods     = getEncodingMethods(numberOfMethods)
    const methodNames = getEncodingMethodNames(numberOfMethods)
    const encodedMaps = encodeWithMethods(methods)
    const [shortestArrByGroups, shortestStrArr] = processEncodedData(encodedMaps, methodNames)
    const shortestJoined = joinWithAmpersand(shortestStrArr)
    displayResults(shortestJoined, shortestArrByGroups, numberOfMethods)
}

/**
 * Sets up event listeners for the mix encoding buttons.
 * This function should be called once the DOM is fully loaded.
 */
export function setupMixEncodingButtons() {
    const buttons = document.querySelectorAll(".mix-encode-button")
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            const methodCount = parseInt(this.getAttribute("data-methods"))
            bestMixFromNMethods(methodCount)
        })
    })
}
