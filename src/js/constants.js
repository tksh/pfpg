// The keys in this array are optional. If a key does not exist, it will be ignored.
export const BASIC_DATA_KEYS = [
    'n',         // required for bruteforce53|bigint64 decoding
    'version',
    'title',     // SVG tag content
    'desc',      // SVG tag content
    'metadata',  // SVG tag content
    'colors'
]


// Spaces in SVg string
export const tabSpace = '    ' // Four spaces

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