export
    { state
    , updateState
    , getState
    }


const state = new Map([
    ['removeOpacity',   false],      // SVG optimization modal
    ['removeNewlines',  false],      // SVG optimization modal
    ['indentByRow',     undefined],  //   For restoring the new-lines
    ['removeSpaces',    false],      // SVG optimization modal
    ['pathMode',        'absoluteSeparated'],  // lines tab | 'absoluteSeparated' / 'relativeMerged'
    ['opacitySteps',    undefined],            // lines tab | 0.2 / 0.1 / 0.04 (detected the nearest from initial decoded SVG)
    ['colorFormat',     'rgb'],                // lines tab | 'hex' / 'rgb'
    ['shapeToTrim',     'square'],  // canvas tab | square / circle / squircle / squircleSlimmed
    ['widthNarrowness', 10],        // canvas tab | 0 / 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 / 15 / 20 / 25 / 30
    ['topHeavyRatio',   1],         // canvas tab | 3 / 2 / 1 / 0 / -1 / -2 / -3
    ['cropSideMargins', false],     // canvas tab |
    ['shapeRendering',  'crispEdge'],  // render tab | 'crispEdge' / 'geometricPrecision'
    ['widthPixelSize',  256],          // render tab |
])




function updateState(key, value) {
    state.set(key, value)
}

function getState(key) {
    return state.get(key)
}