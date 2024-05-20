// Decode from URL Params to SVG when page loaded.
// If there is no URL params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage()
//const svgOutputTextAreaId = getTextareaId()

// decode(isRelative = false, isDataManipulatorPage, svgOutputTextAreaId)  // absolute and separated
// decode(isRelative = true,  isDataManipulatorPage, svgOutputTextAreaId)  // relative and merged
// // 'isDataManipulatorPage = true' will export the generated svg into each textarea

decode(isRelative = false, isDataManipulatorPage)  // absolute and separated
decode(isRelative = true,  isDataManipulatorPage)  // relative and merged
// 'isDataManipulatorPage = true' will export the generated svg into each textarea


