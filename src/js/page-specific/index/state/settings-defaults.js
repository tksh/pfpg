import { getStateUrl
       , updateStateUrl } from 'state/state-as-url-params'

export
    { resvgOption
    , settingsDefaults
    , updateState
    , getState
    }


// Resvg Option: Argument for rendering
const resvgOption = {
    fitTo: {
        mode: 'height',
        value: 256
    }
}



// Settings name keys and default values
//
//   - The default values of below three attributes will be detected from artwork data or browser setting, when page loaded.
//     - 'groupColors' : Extract from lines data
//     - 'opacitySteps': Calculate from from lines data
//     - 'themeColor'  : Define by user's scheme setting, (`prefers-color-scheme: dark` => 'dark', others => 'light')

const settingsDefaults = new Map([
//  ['Attribute name',  default value],     // Appeared at: | Index | Type   | Possible values:
    ['removeOpacity',   false],   // SVG optimization modal |   0   | Bool   | true, false
    ['removeNewlines',  false],   // SVG optimization modal |   1   | Bool   | true, false
    ['removeSpaces',    false],   // SVG optimization modal |   2   | Bool   | true, false

    ['groupColors',     undefined],            // Lines tab |   3   | String | 3|6|10 digits each group-colors hexes has joined with '_', e.g. 12345699FF_000123_FFF
    ['pathMode',        'absoluteSeparated'],  // Lines tab |   4   | String | 'absoluteSeparated', 'relativeMerged'
    ['opacitySteps',    undefined],            // Lines tab |   5   | Float  | 0.2, 0.1, 0.04 (detected the nearest from initial decoded SVG)
    ['colorFormat',     'rgb'],                // Lines tab |   6   | String | 'hex', 'rgb'
    ['shapeToTrim',     'square'],            // Canvas tab |   7   | String | 'square', 'circle', 'squircle', 'squircleSlimmed'
    ['widthNarrowness', 10],                  // Canvas tab |   8   | Uint   | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30
    ['topHeavyRatio',   1],                   // Canvas tab |   9   | Int    | 3, 2, 1, 0, -1, -2, -3
    ['cropSideMargins', false],               // Canvas tab |  10   | Bool   | true, false
    ['shapeRendering',  'crispEdges'],        // Render tab |  11   | String | 'crispEdges', 'geometricPrecision'
    ['widthPixelSize',  256],                 // Render tab |  12   | Uint   | 0 <

    ['viewScaling',     'fit'],                   // UI tab |  13   | String | 'fit', 'actual'
    ['checkerboardBg',  true],                    // UI tab |  14   | Bool   | true, false
    ['textWrapping',    true],                    // UI tab |  15   | Bool   | true, false
    ['themeColor',      undefined],               // UI tab |  16   | String | 'white', 'light', 'dark', 'black'
])


// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key) {
    const stateValue = getStateUrl(key);
    return stateValue !== undefined ? stateValue : settingsDefaults.get(key);
}

function updateState(key, value) {
    updateStateUrl({ [key]: value })
}
