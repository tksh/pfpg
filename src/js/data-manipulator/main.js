// Decode from URL Params to SVG when page loaded.
// If there is no URL params at index.html, Decode from sample hidden text.

const isDataManipulatorOrIndexBool = isDataManipulatorOrIndex()
const svgOutputTextAreaId = getTextareaId()

decode(isRelOrAbsBool = false, isDataManipulatorOrIndexBool, svgOutputTextAreaId)  // absolute and separated
decode(isRelOrAbsBool = true,  isDataManipulatorOrIndexBool, svgOutputTextAreaId)  // relative and merged
// 'isDataManipulatorOrIndexBool = true' will export the generated svg into each textarea


