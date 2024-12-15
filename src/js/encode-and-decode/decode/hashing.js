import { bech32
       , bech32m } from 'libs/bech32-and-bech32m'

export
    { calculateArtworkId
    , sha256HashHexFromMap
    }

async function calculateArtworkId(linesData) {

    // Start time
    const calcArtworkIdStartTime = performance.now()
    console.log('Start the calculating artwork ID ...')

    const compositeSequence = generateCompositeSequence(linesData)
    console.log("compositeSequence: ", compositeSequence)                // 01701701702552551272_6364 ...
    console.log("compositeSequence.length: ", compositeSequence.length)  // e.g.: 7578 (202404_001)

//    const { hashHex, bech32Hash, bech32mHash } = sha256ThenBech32(compositeSequence)

//    strToSha256(compositeSequence).then((digestBuffer) =>
//        console.log("digestBuffer: ", digestBuffer)
//    );

    //const { hashArray, hashHex } = strToSha256(compositeSequence)
    //const { bech32Hash, bech32mHash } = hashArrayToBech32(hashArray)
    const { hashArray, hashHex } = await strToSha256(compositeSequence)
    const { bech32Hash, bech32mHash } = await hashArrayToBech32(hashArray)
    alert(`Hash generated successfully: ${hashHex}`);

    // End time
    const calcArtworkIdEndTime = performance.now()
    const elapsedTime = Math.floor(calcArtworkIdEndTime - calcArtworkIdStartTime)
    console.log('elapsedTime of calculating artwork ID: ', elapsedTime, ' ms')

    // callback( { bech32Hash, bech32mHash } )
    // return { bech32Hash, bech32mHash }
    return { hashHex, bech32Hash, bech32mHash }
}

function generateCompositeSequence(linesData) {
    // Join whole groups sequences with underscore '_' to form:
    // [group_0_values] "_" [group_0_digits] "_" [group_1_values] "_" [group_1_digits] ...

    return Array.from(linesData).map(([key, value]) => createGroupSequence(key, value)).join('_')
}

function createGroupSequence(key, value) {
        // Get two strings of number sequence { values, digits } from each attrs
        const {         gIdVal,         gIdDig } = getSequenceOfGroupId(key)
        const {      colorsVal,      colorsDig } = getSequenceOfColors(value.groupColors)
        const { strokeWidthVal, strokeWidthDig } = getSequenceOfStrokeWidth(value.widthsAndCounts)
        const {    absDvalsVal,    absDvalsDig } = getSequenceOfAbsDvals(value.absDvalsObj)

        // Join whole sequences to form:
        //   values: [g_id] [g_stroke] [g_opacity] [g_stroke_opacity] [widths] [counts] "_" [abs_x1] [abs_y1] [abs_x2] [abs_y2]
        //   digits: [g_id] [g_stroke] [g_opacity] [g_stroke_opacity] [widths] [counts] "_" [abs_x1] [abs_y1] [abs_x2] [abs_y2]

        const valuesSequence = gIdVal + colorsVal + strokeWidthVal + '_' + absDvalsVal
        // e.g.: 2255255255255255_646263596669706366675462656768705860768287929857474967636 ... 33536393739127127127127124

        const digitsSequence = gIdDig + colorsDig + strokeWidthDig + '_' + absDvalsDig
        // e.g.: 133333_22222222222222222222222222222222222222222333332222222222222222222222222222222222222222233333

        return valuesSequence + '_' + digitsSequence
}


function getDigits(number) {
    return number.toString().length
}

function getSequenceOfGroupId(groupId) {
    const gIdVal = groupId.toString()  // e.g.: 0
    const gIdDig = getDigits(groupId)  // e.g.: 1
    return { gIdVal, gIdDig }
}

function getSequenceOfColors(groupColors) {

    // values
    const gStroke        = [...groupColors.gStrokeRgbMap.values()].join('')  // e.g. '170170170'
    const gOpacity       = groupColors.gOpacityUint8.toString()              // e.g. '255'
    const gStrokeOpacity = groupColors.gStrokeOpacityUint8.toString()        // e.g. '255'
    const colorsVal = gStroke + gOpacity + gStrokeOpacity                    // 170170170255255

    // digits
    const gStrokeDig = [...groupColors.gStrokeRgbMap.values()].map(value => getDigits(value)).join('')  // e.g. '333'
    const gOpacityDig = getDigits(gOpacity)                                                             // e.g. '1'
    const gStrokeOpacityDig = getDigits(gStrokeOpacity)                                                 // e.g. '1'
    const colorsDig = gStrokeDig + gOpacityDig + gStrokeOpacityDig

    return { colorsVal, colorsDig }
}

function getSequenceOfStrokeWidth(widthsAndCounts) {
    const widths     = [...widthsAndCounts.widths.values()].join('')
    const counts     = [...widthsAndCounts.counts.values()].join('')
    const widthsDig  = [...widthsAndCounts.widths.values()].map(value => getDigits(value)).join('')
    const countsDig  = [...widthsAndCounts.counts.values()].map(value => getDigits(value)).join('')
    const strokeWidthVal = widths    + counts
    const strokeWidthDig = widthsDig + countsDig
    return { strokeWidthVal, strokeWidthDig }
}

function getSequenceOfAbsDvals(absDvalsObj) {
    // values
    const absDValX1 = [...absDvalsObj.x1.values()].join('')            // e.g.: 6364
    const absDValY1 = [...absDvalsObj.y1.values()].join('')            // e.g.: 00
    const absDValX2 = [...absDvalsObj.x2.values()].join('')            // e.g.: 6364
    const absDValY2 = [...absDvalsObj.y2.values()].join('')            // e.g.: 127127
    const absDvalsVal = absDValX1 + absDValY1 + absDValX2 + absDValY2  // e.g.: 6364006364127127

    // digits
    const absDValDigitsX1 = [...absDvalsObj.x1.values()].map(value => getDigits(value)).join('')  // e.g.: 22
    const absDValDigitsY1 = [...absDvalsObj.y1.values()].map(value => getDigits(value)).join('')  // e.g.: 11
    const absDValDigitsX2 = [...absDvalsObj.x2.values()].map(value => getDigits(value)).join('')  // e.g.: 22
    const absDValDigitsY2 = [...absDvalsObj.y2.values()].map(value => getDigits(value)).join('')  // e.g.: 33
    const absDvalsDig = absDValDigitsX1 + absDValDigitsY1 + absDValDigitsX2 + absDValDigitsY2     // e.g.: 22112233

    return { absDvalsVal, absDvalsDig }
}


// async function sha256ThenBech32(inputStr, hrp = 'uinp') {

//     // 文字列を UTF-8エンコーディング された ArrayBuffer に変換
//     const encoder = new TextEncoder()
//     const utf8 = encoder.encode(inputStr)

//     // SHA-256ハッシュを 計算
//     const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)

//     // 結果の ArrayBuffer を Uint8Array に変換
//     const hashArray = Array.from(new Uint8Array(hashBuffer))

//     // 16進数形式の文字列 を生成
//     const hashHex = uint8ArrayToHexString(hashArray)
//     //console.log("hashHex: ", hashHex)  // e.g.: 9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755

//     // Bech32用の words に変換
//     const words = bech32.toWords(hashArray)
//     //console.log("words: ", words)  // e.g.: (52) [19, 29, 6, 7, 22, 28, 31, ...

//     // Bech32エンコード
//     const bech32Hash = bech32.encode(hrp, words)
//     //console.log("bech32Hash: ", bech32Hash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

//     // Bech32mエンコード
//     const bech32mHash = bech32m.encode(hrp, words)
//     //console.log("bech32mHash: ", bech32mHash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

//     return { hashHex, bech32Hash, bech32mHash }
// }

// uint8Array => hex string (two digits padded)
function uint8ArrayToHexString(uint8Array) {
    return Array.from(uint8Array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// function strToSha256(inputStr) {
async function strToSha256(inputStr) {

    console.log("typeof(inputStr): ", typeof(inputStr))  // string

    // 文字列を UTF-8エンコーディング された ArrayBuffer に変換
    const encoder = new TextEncoder()
    const utf8 = encoder.encode(inputStr)
    console.log("utf8: ", utf8)                  // Uint8Array [48, 49, 55, ...

    // crypto オブジェクトの存在確認 (例)
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      console.error('Web Crypto API is not supported in this environment.');
      return;
    }

    // SHA-256ハッシュを 計算
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)  // Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'digest')

    // 結果の ArrayBuffer を Uint8Array に変換
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // 16進数形式の文字列 を生成
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    console.log("hashHex: ", hashHex)  // e.g.: 9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755

    return hashHex
    // return { hashArray, hashHex }
}

// function hashArrayToBech32(hashArray, hrp = 'glin') {  // 'glin' means the framework name 'gLines'
async function hashArrayToBech32(hashArray, hrp = 'glin') {  // 'glin' means the framework name 'gLines'

    // Bech32用の words に変換
    const words = bech32.toWords(hashArray)
    //console.log("words: ", words)  // e.g.: (52) [19, 29, 6, 7, 22, 28, 31, ...

    // Bech32エンコード
    const bech32Hash = bech32.encode(hrp, words)
    //console.log("bech32Hash: ", bech32Hash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

    // Bech32mエンコード
    const bech32mHash = bech32m.encode(hrp, words)
    //console.log("bech32mHash: ", bech32mHash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

    return { hashHex, bech32Hash, bech32mHash }
}



// function sha256HashHexFromMap(map) {
//     let hash = '';
//     for (const [key, value] of map) {
//         hash += `&${key}=${value}`;
//     }
//     return crypto.subtle.digest('SHA-256', new TextEncoder().encode(hash)).then(hashBuffer => {
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         return uint8ArrayToHexString(hashArray);
//     });
// }

// Mapから SHA-256ハッシュを 生成する非同期関数
async function sha256HashHexFromMap(map) {
    console.log("map:", map)
    // Map(15)
    // 0: {"groupColors" => undefined} If there is no changes for group colors. But for hashing, it's OK.

    let statesKvJoinedAsStr = '';
    for (const [key, value] of map) {
        statesKvJoinedAsStr += `&${key}=${value}`;
    }
    console.log("statesKvJoinedAsStr:", statesKvJoinedAsStr)
    // e.g: &groupColors=undefined&pathMode=absoluteSeparated& ... &themeColor=dark

    const encoder = new TextEncoder();
    const encodedHash = encoder.encode(statesKvJoinedAsStr);

    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedHash);  // TypeError: Cannot read properties of undefined (reading 'digest')
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return uint8ArrayToHexString(hashArray);
}
