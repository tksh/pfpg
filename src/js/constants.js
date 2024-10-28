// The keys in this array are optional. If a key does not exist, it will be ignored.
export const BASIC_DATA_KEYS = [
    'n',         // required for bruteforce53|bigint64 decoding
    'version',
    'title',     // SVG tag content
    'desc',      // SVG tag content
    'metadata',  // SVG tag content
    'colors'
]


// Spaces in SVG string
export const tabSpace = '\u0020\u0020\u0020\u0020' // Four spaces

// VIEWBOX_START_X and VIEWBOX_START_Y represent the starting position of the viewBox,
// which is always at the origin (0,0).
export const VIEWBOX_START_X = 0
export const VIEWBOX_START_Y = 0


// Map object to get 1st and 2nd flag char:
//   key: String of method name
// value: Char for flag

// 1st char (Compression method):
//     [~] None (uncompressed)
//     [0] URLCompressor
// 2nd char (Encoding methods):
//     [0] bruteforce53-enc
//     [1] bigint64-enc
//     [2] swap63-enc
//     [3] four16-enc
export const flagsMap = new Map([
    ['1st', new Map([
                ['uncompressed',  '~'],
                ['URLCompressor', '0'],
                ['deflateRaw',    '1'],
            ])
    ],
    ['2nd', new Map([
                ['bruteforce53', '0'],
                ['bigint64',     '1'],
                ['swap63',       '2'],
                ['four16',       '3'],
            ])
    ]
])

// Add KV reversed maps of 1st and 2nd into `flagsMap`,
// to indicate the method names to console

// 1st
const reverse1st = new Map()
flagsMap.get('1st').forEach((value, key) => {
    reverse1st.set(value, key)
})
flagsMap.set('rev_1st', reverse1st)

// 2nd
const reverse2nd = new Map()
flagsMap.get('2nd').forEach((value, key) => {
    reverse2nd.set(value, key)
})
flagsMap.set('rev_2nd', reverse2nd)

// Result
console.log("flagsMap: ", flagsMap)
// flagsMap:
// Map(4) { 1st → Map(2), 2nd → Map(4), rev_1st → Map(2), rev_2nd → Map(4) }
//   ​size: 4
//   ​<entries>
//     ​​0: 1st → Map { uncompressed → "~", URLCompressor → "0" }
//     ​​1: 2nd → Map(4) { bruteforce53 → "0", bigint64 → "1", swap63 → "2", … }
//     ​​2: rev_1st → Map { "~" → "uncompressed", 0 → "URLCompressor" }
//     ​​3: rev_2nd → Map(4) { 0 → "bruteforce53", 1 → "bigint64", 2 → "swap63", … }


// The sets of encoding method name and its configuration value
export const encodingMethodAndConfig = new Map([
    ['bruteforce53', 'baseXNumber'],
    ['bigint64',     'digitsPerChunk'],
    ['swap63',       'swap53HasNoConfigValue'],
    ['four16',       'four16HasNoConfigValue'],
])


// To store the info for console output
export const resultInfo = new Map()





// Settings name keys and default values
//
//   - The default values of below three attributes will be detected from artwork data or browser setting, when page loaded.
//     - 'groupColors' : Extract from lines data
//     - 'opacitySteps': Calculate from from lines data
//     - 'themeColor'  : Define by user's scheme setting, (`prefers-color-scheme: dark` => 'dark', others => 'light')

export const SETTINGS_DEFAULTS = new Map([
//  ['Attribute name',   default value],     // Appeared at: | Index | Type   | Possible values:
    ['removeOpacity',    false],   // SVG optimization modal |   0   | Bool   | true, false
    ['removeLineBreaks', false],   // SVG optimization modal |   1   | Bool   | true, false
    ['removeSpaces',     false],   // SVG optimization modal |   2   | Bool   | true, false

    ['groupColors',      undefined],            // Lines tab |   3   | String | 3|6|10 digits each group-colors hexes has joined with '_', e.g. 12345699FF_000123_FFF
    ['pathMode',         'absoluteSeparated'],  // Lines tab |   4   | String | 'absoluteSeparated', 'relativeMerged'
    ['opacitySteps',     undefined],            // Lines tab |   5   | Float  | 0.2, 0.1, 0.04 (detected the nearest from initial decoded SVG)
    ['colorFormat',      'rgb'],                // Lines tab |   6   | String | 'hex', 'rgb'
    ['shapeToTrim',      'square'],            // Canvas tab |   7   | String | 'square', 'circle', 'squircle', 'squircleSlimmed'
    ['widthNarrowness',  10],                  // Canvas tab |   8   | Uint   | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30
    ['topHeavyRatio',    1],                   // Canvas tab |   9   | Int    | 3, 2, 1, 0, -1, -2, -3
    ['cropSideMargins',  false],               // Canvas tab |  10   | Bool   | true, false
    ['shapeRendering',   'crispEdges'],        // Render tab |  11   | String | 'crispEdges', 'geometricPrecision'
    ['widthPixelSize',   256],                 // Render tab |  12   | Uint   | 0 <

    ['viewScaling',      'fit'],                   // UI tab |  13   | String | 'fit', 'actual'
    ['checkerboardBg',   true],                    // UI tab |  14   | Bool   | true, false
    ['textWrapping',     true],                    // UI tab |  15   | Bool   | true, false
    ['buttonAction',     'download'],              // UI tab |  16   | String | 'download', 'copy'
    ['themeColor',       undefined],               // UI tab |  17   | String | 'white', 'light', 'dark', 'black'
])
