import { isOnDataManipulatorPage } from '../../encode-and-decode/decode/select-output-textarea.js'
import { decode } from '../../encode-and-decode/decode/decode.js'

const isRelative = false   // Default value of path-mode is 'Absolute and separated'
decode(isRelative, isOnDataManipulatorPage())
// decode(isRelative = false, isOnDataManipulatorPage())  // absolute and separated
