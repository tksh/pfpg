
// The keys in this array are optional. If a key does not exist, it will be ignored.
export const BASIC_DATA_KEYS = ['version', 'title', 'desc', 'metadata', 'colors'];


// VIEWBOX_START_X and VIEWBOX_START_Y represent the starting position of the viewBox,
// which is always at the origin (0,0).
export const VIEWBOX_START_X = 0;
export const VIEWBOX_START_Y = 0;


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
export const flagsMap = new Map([
    ['1st', new Map([
                ['uncompressed',  '~'],
                ['URLCompressor', '0']
            ])
    ],
    ['2nd', new Map([
                ['bruteforce53', '0'],
                ['bigint64',     '1'],
                ['swap63',       '2']
            ])
    ]
]);

// Add KV reversed maps of 1st and 2nd into `flagsMap`,
// to indicate the method names to console

// 1st
const reverse1st = new Map();
flagsMap.get('1st').forEach((value, key) => {
    reverse1st.set(value, key);
});
flagsMap.set('rev_1st', reverse1st)

// 2nd
const reverse2nd = new Map();
flagsMap.get('2nd').forEach((value, key) => {
    reverse2nd.set(value, key);
});
flagsMap.set('rev_2nd', reverse2nd)



// 3rd flag - Configuration value for each encoding methods:
//   Base X number (base53Enc applied) for bruteforce53-enc [0]
//   Chunk size number for bigint64-enc [1]
//   'n' (=null, skip it for decoding) for swap63-enc [2]



export const resultInfo = new Map()