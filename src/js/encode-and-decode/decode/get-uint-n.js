import { getUrlParams }              from 'common-utils/read-url-params'
import { isOnDataManipulatorPage }   from 'common-utils/select-output-textarea'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'

// Get the N number of UIntNPortray for Bruteforce53 decoding

export function getUintNFromUrlParams() {
  // Detect the url: 'index.html' or 'data-manipulator.html'
  const isDataManipulatorPage = isOnDataManipulatorPage()

  // Get the url params
  const params = new URLSearchParams(window.location.search)
  // toString() returns an empty string for no parameters, otherwise a truthy value.
  const paramsExists = params.toString() !== '';

  if (paramsExists === true) {

    // Get the url params from right source
    const urlSearchParams = getUrlParams(params, isDataManipulatorPage)

    // Get the basic data as Map
    const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
    console.log('basicDataObj: ', basicDataObj)
    // e.g.:
    // Object
    //   desc: "A portrait of a woman based on an image from the Unsplash website"
    //   metadata: "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc= ... </dc:source>\n</rdf:RDF>"
    //   n: "7"
    //   title: "202401_001"
    //   version: "0.9.0"
    //   [[Prototype]]: Object

    return basicDataObj.n
  }
}

export const uintN = getUintNFromUrlParams()