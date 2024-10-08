import { getSvgString }           from 'download'
import { getInitialOpacitySteps } from 'init/get-initial-opacity-steps'
import { getState
       , updateState }            from 'state/state-as-map-obj'


export async function setDefaultValueOfOptions() {
    console.log('setDefaultValueOfOptions(state) executed')

    // SVGのテキストを取得
    const inputSvg = getSvgString()

    // Get each attrs values, then set it as default
    setDefaultOfPathMode(inputSvg)                              // Path mode
    setDefaultOfOpacitySteps(getInitialOpacitySteps())  // Opacity steps
    // setDefaultOfOpacitySteps(getInitialOpacitySteps(inputSvg))  // Opacity steps
}


// Selector: Path mode
function setDefaultOfPathMode(inputSvg) {

    let isAbsolute

    // Get the value via svg string, if url param not exists
    if (!getState('pathMode')) {
        // Find the '<path d= ... M ... L ... >' to detect as 'absolute'
        const pattern = /<path[^>]*d="[^"]*M[^"]*L[^"]*"[^>]*>/g
        isAbsolute = pattern.test(inputSvg)
    } else {
        isAbsolute = getState('pathMode') === 'absoluteSeparated'
    }

    // Set the 'Path mode' input element value
    if (isAbsolute === true) {
        document.getElementById("path-mode").value = 'absoluteSeparated'
        console.log("Default 'Path mode' is 'Absolute and separated'")
        updateState('pathMode', 'absoluteSeparated')
    } else {
        document.getElementById("path-mode").value = 'relativeMerged'
        console.log("Default 'Path mode' is 'Relative and merged'")
        updateState('pathMode', 'relativeMerged')
    }
}


// Number and Range input: Width pixel size
function setDefaultOfOpacitySteps(opacitySteps) {

    // Set the default value of html element
    document.getElementById("opacity-steps").value = opacitySteps

    // Update the state as url params
    updateState('opacitySteps', opacitySteps)

    console.log(`Default 'Opacity steps' value is "${opacitySteps}"`)
}
