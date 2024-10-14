import { SETTINGS_DEFAULTS } from 'constants'
export
{ getStateUrlsOfImageCustomization, getStateUrlsOfSvgOptimization, getStateUrlsOfUiConfiguration, getState, getStateUrl, updateState, updateStateUrl, removeUrlParams}
function getState(key) {const stateValue = getStateUrl(key)
return stateValue !== undefined ? stateValue : SETTINGS_DEFAULTS.get(key)}
function getStateUrl(key) {const allParams = getAllStateUrls()
return allParams[key]}
function getAllStateUrls() {const params = new URLSearchParams(window.location.search)
return Object.fromEntries(Array.from(params.entries())
.filter(([key]) => SETTINGS_DEFAULTS.has(key))
.map(([key, value]) => {if (value.toLowerCase() === 'true') return [key, true]
if (value.toLowerCase() === 'false') return [key, false]
return [key, value]}))}
function updateState(key, value) {updateStateUrl({ [key]: value })}
function updateStateUrl(params) {const currentParams = getAllStateUrls()
const updatedParams = { ...currentParams, ...params }
setStateUrl(updatedParams)}
function setStateUrl(params) {const url = new URL(window.location.href)
Object.entries(params).forEach(([key, value]) => {if (value === null || value === undefined) {url.searchParams.delete(key)} else {url.searchParams.set(key, value)}})
window.history.replaceState({}, '', url)}
function getStateUrlsInRange(startIndex, endIndex) {const allParams = getAllStateUrls()
const stateKeys = Array.from(SETTINGS_DEFAULTS.keys()).slice(startIndex, endIndex)
return new Map(Object.entries(allParams).filter(([key]) => stateKeys.includes(key)))}
function getStateUrlsOfSvgOptimization() {return getStateUrlsInRange(0, 3)}
function getStateUrlsOfImageCustomization() {return getStateUrlsInRange(3, 13)}
function getStateUrlsOfUiConfiguration() {return getStateUrlsInRange(13, SETTINGS_DEFAULTS.size)}
function removeUrlParams(keysToRemove) {const url = new URL(window.location.href)
keysToRemove.forEach(key => {url.searchParams.delete(key)})
window.history.replaceState({}, '', url)}