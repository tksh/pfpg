import { isOnDataManipulatorPage } from 'decode/select-output-textarea'
import { decode }                  from 'decode/decode'

// Decode from URL Params to SVG when page loaded.
// If there is no URL params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage()


// 'isDataManipulatorPage = true' will export the generated relative and absolute style SVGs into each textarea.

decode(isRelative = true,  isDataManipulatorPage)  // relative and merged
decode(isRelative = false, isDataManipulatorPage)  // absolute and separated


