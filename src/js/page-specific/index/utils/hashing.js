import { bech32
       , bech32m } from '@scure/base'

export
    { sha256HashHexFromMap
    , strToSha256
//    , hashArrayToBech32
    }

// uint8Array => hex string (two digits padded)
function uint8ArrayToHexString(uint8Array) {
    return Array.from(uint8Array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// function strToSha256(inputStr) {
    const encoder = new TextEncoder()
async function strToSha256(inputStr) {

    console.log("strToSha256() - inputStr.length: ", inputStr.length)
    console.log("strToSha256() - typeof(inputStr): ", typeof(inputStr))  // string

    // 文字列を UTF-8エンコーディング された ArrayBuffer に変換

    // const encoder = new TextEncoder()
    const utf8 = encoder.encode(inputStr)
    console.log("strToSha256() - utf8: ", utf8)                  // Uint8Array [48, 49, 55, ...

    // crypto オブジェクトの存在確認 (例)
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      console.error('Web Crypto API is not supported in this environment.');
      return;
    }

    // SHA-256ハッシュを 計算
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)  // Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'digest')

    // 結果の ArrayBuffer を Uint8Array に変換
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    console.log("strToSha256() - hashArray: ", hashArray)

    // 16進数形式の文字列 を生成
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    console.log("strToSha256() - hashHex: ", hashHex)  // e.g.: 9f4c7b73e27ae5c198aec93a687d9d82d471d5ad34c5ce6a4f08f0e52d4ef755

    return { hashArray, hashHex }
}

function hashArrayToBech32(hashArray, hrp = 'glin') {  // 'glin' means the framework name 'gLines'
// async function hashArrayToBech32(hashArray, hrp = 'glin') {  // 'glin' means the framework name 'gLines'

    // Bech32用の words に変換
    const words = bech32.toWords(hashArray)
    //console.log("words: ", words)  // e.g.: (52) [19, 29, 6, 7, 22, 28, 31, ...

    // Bech32 エンコード
    const bech32Hash = bech32.encode(hrp, words)
    //console.log("bech32Hash: ", bech32Hash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

    // Bech32m エンコード
    const bech32mHash = bech32m.encode(hrp, words)
    //console.log("bech32mHash: ", bech32mHash)  // e.g.: glin1nax8kulz0tjurx9weyaxslvast28r4ddxnzuu6j0prcw2t2w7a2srmk7hs

    return { bech32Hash, bech32mHash }
}


// Mapから SHA-256ハッシュを 生成する非同期関数
async function sha256HashHexFromMap(map) {
    console.log("map:", map)
    // Map(15)
    // 0: {"groupColors" => undefined} If there is no changes for group colors. But for hashing, it's OK.

    let stateKvJoinedAsStr = '';
    for (const [key, value] of map) {
        stateKvJoinedAsStr += `&${key}=${value}`;
    }
    console.log("stateKvJoinedAsStr:", stateKvJoinedAsStr)
    // e.g: &groupColors=undefined&pathMode=absoluteSeparated& ... &themeColor=dark

    return strToSha256(stateKvJoinedAsStr)
//    const encoder = new TextEncoder();
//    const encodedHash = encoder.encode(stateKvJoinedAsStr);
//
//    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedHash);  // TypeError: Cannot read properties of undefined (reading 'digest')
//    const hashArray = Array.from(new Uint8Array(hashBuffer));
//
//    return uint8ArrayToHexString(hashArray);
}
