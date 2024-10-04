import { updateStateUrl
       , getStateUrl } from 'state/state-as-url-params'

export
    { stateList
    , updateState
    , getState
    }


// State keys and default values
//   - 'opacitySteps' value will be detected from initial decoded svg string when first page loaded.

const stateList = new Map([                          // At: | Possible values:
    ['removeOpacity',   false],   // SVG optimization modal | true, false
    ['removeNewlines',  false],   // SVG optimization modal | true, false
    ['removeSpaces',    false],   // SVG optimization modal | true, false
    ['groupColors',     undefined],            // Lines tab | [3|6|10] digits hex code tha has joined each group with '_', e.g.: 12345699FF_000123_FFF
    ['pathMode',        'absoluteSeparated'],  // Lines tab | 'absoluteSeparated', 'relativeMerged'
    ['opacitySteps',    undefined],            // Lines tab | 0.2, 0.1, 0.04 (detected the nearest from initial decoded SVG)
    ['colorFormat',     'rgb'],                // Lines tab | 'hex', 'rgb'
    ['shapeToTrim',     'square'],            // Canvas tab | 'square', 'circle', 'squircle', 'squircleSlimmed'
    ['widthNarrowness', 10],                  // Canvas tab | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30
    ['topHeavyRatio',   1],                   // Canvas tab | 3, 2, 1, 0, -1, -2, -3
    ['cropSideMargins', false],               // Canvas tab | true, false
    ['shapeRendering',  'crispEdge'],         // Render tab | 'crispEdge', 'geometricPrecision'
    ['widthPixelSize',  256],                 // Render tab | true, false
    ['viewScaling',     'fit'],                   // UI tab | 'fit', 'actual'
    ['checkerboard',    true],                    // UI tab | true, false
    ['textWrapping',    true],                    // UI tab | true, false
    ['themeColor',      'dark'],                  // UI tab | 'white', 'light', 'dark', 'black'
])


// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key) {
    const urlValue = getStateUrl(key);
    return urlValue !== undefined ? urlValue : stateList.get(key);
}

function updateState(key, value) {
    updateStateUrl({ [key]: value })
}
