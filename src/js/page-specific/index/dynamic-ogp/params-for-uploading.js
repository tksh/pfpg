import { murmurHash3_x64_128 }   from '@timepp/murmurhash';
import { SETTINGS_DEFAULTS,
         VISUAL_CONFIG_DEFAULTS,
         BASIC_DATA_KEYS }       from 'constants'

export
    { getHashForOgImageUrl
    , getBackgroundColorByTheme
    , getYearAndMonth
    }


/**
 * Generates a unique hash for an OG image URL by combining artwork and configuration hashes.
 *
 * @async
 * @function getHashForOgImageUrl
 * @returns {Promise<string>} A 32-character hexadecimal string representing the final hash
 */
async function getHashForOgImageUrl() {
    // Hash string of artwork data and its visual config settings
    const { artwork, config } = await getOgImageData();
    console.log('artwork, config: ', artwork, config)

    const hashInputStr = JSON.stringify([artwork, config]);
    console.log('hashInputStr', hashInputStr)
    // e.g.: [[["A","08fEKQ-VoisNalNhZy9GsmZzPU"],["0","08cJqY-3JMVTyH83QAsTiL3FDTn ... ,null,"rgb","square",10,1,true,"crispEdges",256]]

    const hashBigInt = murmurHash3_x64_128(hashInputStr)
    console.log('hashBigInt', hashBigInt)
    // e.g.: 323066209079833201260614758727406931990n

    const hashHexPadded = hashBigInt.toString(16).padStart(32, '0');
    console.log('hashHexPadded', hashHexPadded)
    // e.g.: 4327a70c6f036487c22f4075c965c9e3

    return hashHexPadded
}

async function getOgImageData() {
   const params = new URLSearchParams(window.location.search);
   console.log('params for OGP: ', params)

   const artwork = [];

   for (const [key, value] of params) {
       if (!SETTINGS_DEFAULTS.has(key) && !BASIC_DATA_KEYS.includes(key)) {  // Extract the lines data only
           artwork.push([key, value]);
       }
   }

   const config = [];
   for (const [key, defaultValue] of VISUAL_CONFIG_DEFAULTS) {
       config.push(params.has(key) ? params.get(key) : defaultValue);
   }

   return { artwork, config };
}


// Get the bg fill color as themeColor's `--color-bg` via css/index/color.css
// - white: white    = #ffffff = rgba(255, 255, 255, 1)
// - light: darkgray = #a9a9a9 = rgba(169, 169, 169, 1)
// - dark : #222     = #222222 = rgba( 34,  34,  34, 1)
// - black: #000     = #000000 = rgba(  0,   0,   0, 1)

// テーマカラーに基づいて背景色のRGBA値を取得する関数
function getBackgroundColorByTheme(themeName) {
    const themeColors = {
        'white': 'rgba(255, 255, 255, 1)',
        'light': 'rgba(169, 169, 169, 1)',
        'dark': 'rgba(34, 34, 34, 1)',
        'black': 'rgba(0, 0, 0, 1)'
    };

    return themeColors[themeName] || 'rgba(255, 255, 255, 0)'; // デフォルトは透明
}


function getYearAndMonth() {
    const dt = new Date();

    const yyyy = dt.getFullYear();
    console.log("yyyy: ", yyyy)      // e.g.: 2024

    const mm = ("00" + (dt.getMonth() + 1)).slice(-2);  // getMonth() 関数は １月を 0 として返却するので １を加算
    console.log("mm: ", mm)          // e.g.: 12

    const yyyymm = `${yyyy}${mm}`
    console.log("yyyymm: ", yyyymm)  // e.g.: 202412

    return { yyyy, yyyymm }
}
