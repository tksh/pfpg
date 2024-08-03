import { getUrlParams }            from 'utils/read-url-params'
import { isOnDataManipulatorPage } from 'decode/select-output-textarea'
import { getBasicDataFromUrlParam } from 'enc-and-dec/basic-data/basic-data-dec'

// Get the N number of UIntNPortray for Bruteforce53 decoding

export function getUintNFromUrlParams() {
  // Detect the url: 'index.html' or 'data-manipulator.html'
  const isDataManipulatorPage = isOnDataManipulatorPage()

  // Get the URL params
  const params = new URLSearchParams(window.location.search)

  // Get the URL params from right source
  const paramsArray = getUrlParams(params, isDataManipulatorPage)

  // Get the basic data as Map
  const basicDataMap = getBasicDataFromUrlParam(paramsArray)
  console.log('basicDataMap: ', basicDataMap)
  // Map(4) { title → "202404_001", viewbox → "0 0 31 31", uintN → 5, rectFill → "fff" }

  return basicDataMap.get("uintN")
}
