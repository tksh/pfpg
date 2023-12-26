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



function extractAfterFirstHyphen(str) {
    // ハイフンの位置を取得
    const index = str.indexOf("-");
    // ハイフンの次の位置から末尾までを切り出す
    const result = str.slice(index + 1);

    return result
}
