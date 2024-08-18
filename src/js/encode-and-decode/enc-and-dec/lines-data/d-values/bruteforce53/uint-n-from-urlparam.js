import { getUrlParams }            from 'common-utils/read-url-params'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'

// Get the N number of UIntNPortray for Bruteforce53 decoding

export function getUintNFromUrlParams() {
  // Detect the url: 'index.html' or 'data-manipulator.html'
  const isDataManipulatorPage = isOnDataManipulatorPage()

  // Get the url params
  const params = new URLSearchParams(window.location.search)

  // Get the url params from right source
  const urlSearchParams = getUrlParams(params, isDataManipulatorPage)

  // Get the basic data as Map
  const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
  console.log('basicDataObj: ', basicDataObj)
  // Map(4) { title → "202404_001", viewbox → "0 0 31 31", uintN → 5, rectFill → "fff" }

  return basicDataObj.get("uintN")
}
