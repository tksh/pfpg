import { getUrlParamsExceptsStates } from 'common-utils/read-url-params'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'

// Get the N number of UIntNPortray for bruteforce53 and bigint64 decoding

export function getUintNFromUrlParams() {
  // Retrieve URL parameters
  const urlSearchParams = getUrlParamsExceptsStates()

  // Get the basic data as Map
  const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
  //console.log('basicDataObj: ', basicDataObj)
  // e.g.:
  // Object
  //   desc: "A portrait of a woman based on an image from the Unsplash website"
  //   metadata: "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc= ... </dc:source>\n</rdf:RDF>"
  //   bits: "7"
  //   title: "202401_001"
  //   version: "0.9.0"
  //   [[Prototype]]: Object

  return basicDataObj.bits
}
