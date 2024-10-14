import { getUrlParamsExceptsStates } from 'common-utils/read-url-params'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'
export function getUintNFromUrlParams() {const urlSearchParams = getUrlParamsExceptsStates()
const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
return basicDataObj.n}