import { calculateArtworkHash } from 'dynamic-ogp/calc-artwork-hash'
import { calculateConfigHash }  from 'dynamic-ogp/calc-config-hash'
import { strToSha256 }          from 'utils/hashing'
import { SETTINGS_DEFAULTS,
         VISUAL_CONFIG_DEFAULTS,
         BASIC_DATA_KEYS }      from 'constants'

export
    { getOgImageData
    , getHashForOgImageUrl
    , getBackgroundColorByTheme
    , getYearAndMonth
    }


/**
 * Generates a unique hash for an OG image URL by combining artwork and configuration hashes.
 * The function merges two SHA-256 hashes (artwork hash and config hash) and creates a new
 * SHA-256 hash from the combined string.
 *
 * @async
 * @function getHashForOgImageUrl
 * @returns {Promise<string>} A 64-character hexadecimal string representing the final hash
 */
async function getHashForOgImageUrl() {
    // Hash string of artwork data and its visual config settings
    const artworkHash = await calculateArtworkHash()
    const configHash = await calculateConfigHash()
    console.log('artworkHash, configHash: ', artworkHash, configHash)
    // e.g.:
    //     artworkHash: string(64 char) 9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755
    //     configHash:  string(64 char) 955ba886ffccc1993d9bc57884eff136b8800a43befaa1b30da65192a94ba1d1

    // Merge 'Artwork hash' and 'Config hash' to get 'Configured artwork hash'
    const twoHashMerged = artworkHash + configHash
    console.log('twoHashMerged: ', twoHashMerged)
    // e.g.: string(128 char) 9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755955ba886ffccc1993d9bc57884eff136b8800a43befaa1b30da65192a94ba1d1

    const { hashArray, hashHex } = await strToSha256(twoHashMerged)
    console.log('hashArray, hashHex: ', hashArray, hashHex)

    return hashHex
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
