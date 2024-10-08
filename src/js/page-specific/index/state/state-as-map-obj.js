import { updateStateUrl
       , getStateUrl } from 'state/state-as-url-params'

export
    { resvgOption
    , stateList
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

// State keys and default values
//   - These two attributes default value will be detected from initial decoded svg string when first page loaded.
//     - 'groupColors'
//     - 'opacitySteps'


const stateList = new Map([                          // At: | Index | Possible values:
    ['removeOpacity',   false],   // SVG optimization modal |   0   | true, false
    ['removeNewlines',  false],   // SVG optimization modal |   1   | true, false
    ['removeSpaces',    false],   // SVG optimization modal |   2   | true, false

    ['groupColors',     undefined],            // Lines tab |   3   | [3|6|10] digits hex code tha has joined each group with '_', e.g.: 12345699FF_000123_FFF
    ['pathMode',        'absoluteSeparated'],  // Lines tab |   4   | 'absoluteSeparated', 'relativeMerged'
    ['opacitySteps',    undefined],            // Lines tab |   5   | 0.2, 0.1, 0.04 (detected the nearest from initial decoded SVG)
    ['colorFormat',     'rgb'],                // Lines tab |   6   | 'hex', 'rgb'
    ['shapeToTrim',     'square'],            // Canvas tab |   7   | 'square', 'circle', 'squircle', 'squircleSlimmed'
    ['widthNarrowness', 10],                  // Canvas tab |   8   | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30
    ['topHeavyRatio',   1],                   // Canvas tab |   9   | 3, 2, 1, 0, -1, -2, -3
    ['cropSideMargins', false],               // Canvas tab |  10   | true, false
    ['shapeRendering',  'crispEdges'],        // Render tab |  11   | 'crispEdges', 'geometricPrecision'
    ['widthPixelSize',  256],                 // Render tab |  12   | true, false

    ['viewScaling',     'fit'],                   // UI tab |  13   | 'fit', 'actual'
    ['checkerboard',    true],                    // UI tab |  14   | true, false
    ['textWrapping',    true],                    // UI tab |  15   | true, false
    ['themeColor',      'dark'],                  // UI tab |  16   | 'white', 'light', 'dark', 'black'
])


// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key) {
    const urlValue = getStateUrl(key);
    return urlValue !== undefined ? urlValue : stateList.get(key);
}

function updateState(key, value) {
    updateStateUrl({ [key]: value })
}

//function updateState(key, value) {
//    // "true" か "false" の場合にのみブール値に変換
//    const parsedValue = (value === "true") ? true : (value === "false") ? false : value;
//
//    // 状態をURLに更新する
//    updateStateUrl({ [key]: parsedValue });
//}