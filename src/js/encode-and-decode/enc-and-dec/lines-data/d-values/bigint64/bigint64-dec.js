import { absToRel }                   from 'enc-and-dec/d-values/bigint64/abs-to-rel'
import { recoverOriginalZeroPadding } from 'enc-and-dec/d-values/bigint64/recover-zero-padding'

export
    { bigint64Dec
    , findNearestMultipleOfFourX
    , chunk
    }

function bigint64Dec(encodedDvalsStr, threeFlags) {

    // Decode as bigint
    const decodedDvalsBigint = base64UrlDec(encodedDvalsStr)
    //console.log("decodedDvalsBigint: ", decodedDvalsBigint)
    // 10407060807192524283017042226222223230000001520050…232224312626252321230005242225273122091720232710n

    // Convert to String
    const bigintAsStr = String(decodedDvalsBigint)
    //console.log("bigintAsStr: ", bigintAsStr)
    // 1040706080719252428301704222622222323000000152005000015000028 ... 32710

    // Determine the number of digits per chunk based on the third flag
    const digitsPerChunk = Number(threeFlags[2])

    // Recover the original zero-padded string
    const originalZeroPaddedStr = recoverOriginalZeroPadding(bigintAsStr, digitsPerChunk)
    console.log("originalZeroPaddedStr: ", originalZeroPaddedStr)
    // 01040706080719252428301704222622222323000000152005000015000028 ... 32710


    // Split with 4 into each coordinates like x1, y1, x2, y2
    const splittedDvalsStr = splitStringIntoFour(originalZeroPaddedStr)
    // Split into chunks
    const chunkedDvalsStr = splittedDvalsStr.map(str => chunk(str, digitsPerChunk))
    // console.log("chunkedDvalsStr: ", chunkedDvalsStr)
    // (4) [Array(19), Array(19), Array(19), Array(19)]
    //     0: (19) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23']
    //     1: (19) ['00', '00', '00', '15', '20', '05', '00', '00', '15', '00', '00', '28', '24', '00', '11', '16', '19', '22', '08']
    //     2: (19) ['01', '04', '06', '10', '08', '11', '24', '26', '24', '28', '30', '20', '08', '24', '23', '22', '24', '31', '26']
    //     3: (19) ['26', '25', '23', '21', '23', '00', '05', '24', '22', '25', '27', '31', '22', '09', '17', '20', '23', '27', '10']

    // Parse as Number
    const decodedAbsDvals = chunkedDvalsStr.map(subArray => subArray.map(Number))
    // console.log("decodedAbsDvals: ", decodedAbsDvals)
    // (4) [Array(19), Array(19), Array(19), Array(19)]
    //     0: (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]
    //     1: (19) [0, 0, 0, 15, 20, 5, 0, 0, 15, 0, 0, 28, 24, 0, 11, 16, 19, 22, 8]
    //     2: (19) [1, 4, 6, 10, 8, 11, 24, 26, 24, 28, 30, 20, 8, 24, 23, 22, 24, 31, 26]
    //     3: (19) [26, 25, 23, 21, 23, 0, 5, 24, 22, 25, 27, 31, 22, 9, 17, 20, 23, 27, 10]length: 4[[Prototype]]: Array(0)

    // Convert from absolute to relative
    const decodedRelDvals = absToRel(decodedAbsDvals)
    // console.log("decodedRelDvals: ", decodedRelDvals)
    // (4) [Array(19), Array(19), Array(19), Array(19)]
    //     0: (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]
    //     1: (19) [0, -26, -25, -8, -1, -18, 0, -5, -9, -22, -25, 1, -7, -22, 2, -1, -1, -1, -19]
    //     2: (19) [0, 0, -1, 4, 0, 4, 5, 1, 0, 0, 0, 3, 4, 2, -3, 0, 2, 8, 3]
    //     3: (19) [26, 25, 23, 6, 3, -5, 5, 24, 7, 25, 27, 3, -2, 9, 6, 4, 4, 5, 2]
    // length: 4

    return { relative: decodedRelDvals, absolute: decodedAbsDvals }
}



function findNearestMultipleOfFourX(number, multiple) {
    // numberを (multiple*4) で割って切り上げた値に (multiple*4) を掛けると、求める数値になる
    return Math.ceil(number / (multiple * 4)) * (multiple * 4);
}
// Test
// console.log(findNearestMultipleOfFourX(23, 3))  // 24
// console.log(findNearestMultipleOfFourX(17, 2))  // 24
// console.log(findNearestMultipleOfFourX(119, 3)) // 120
// console.log(findNearestMultipleOfFourX(120, 2)) // 120
// console.log(findNearestMultipleOfFourX(151, 2)) // 152


function splitStringIntoFour(str) {
    // 文字列の長さを取得
    const len = str.length;
    // 文字列の長さを4で割って、1つの部分の長さを求める
    const part = len / 4;
    // substringメソッドで4つの部分に切り出す
    const x1 = str.substring(0, part);
    const y1 = str.substring(part, part * 2);
    const x2 = str.substring(part * 2, part * 3);
    const y2 = str.substring(part * 3, part * 4);
    // 4つの部分を配列にして返す
    return [x1, y1, x2, y2];
};
// Test
// console.log(splitStringIntoFour('abcdefgh')) // (4) ['ab', 'cd', 'ef', 'gh']



// Convert to Javascript from Deno standard library chunk.ts

// https://github.com/denoland/deno_std/blob/main/collections/chunk.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

function chunk(array, size) {
    if (size <= 0 || !Number.isInteger(size)) {
        throw new Error(
            `Expected size to be an integer greater than 0 but found ${size}`,
        );
    }

    if (array.length === 0) {
        return [];
    }

    const ret = Array.from({ length: Math.ceil(array.length / size) });
    let readIndex = 0;
    let writeIndex = 0;

    while (readIndex < array.length) {
        ret[writeIndex] = array.slice(readIndex, readIndex + size);

        writeIndex += 1;
        readIndex += size;
    }

    return ret;
}

// Test
// const array = [1, 2, 3, 4, 5, 6, 7, 8];
// const array = ;
// const size = 3;
// const result = chunk(array, size);
// console.log(result); // [[1, 2, 3], [4, 5, 6], [7, 8]]

// console.log(chunk("357956327150778", size)); ['357', '956', '327', '150', '778']
// console.log(chunk("01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710", 2));
// (76) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23', '00', '00', '00', '15', '20', '05', '00', '00', '15', '00', '00', '28', '24', '00', '11', '16', '19', '22', '08', '01', '04', '06', '10', '08', '11', '24', '26', '24', '28', '30', '20', '08', '24', '23', '22', '24', '31', '26', '26', '25', '23', '21', '23', '00', '05', '24', '22', '25', '27', '31', '22', '09', '17', '20', '23', '27', '10']
// console.log(chunk("001004007006008007019025024028030017004022026022022023023", 3))
// (19) ['001', '004', '007', '006', '008', '007', '019', '025', '024', '028', '030', '017', '004', '022', '026', '022', '022', '023', '023']
