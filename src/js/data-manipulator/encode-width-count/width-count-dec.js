////////////////////////////////// Input: //////////////////////////////////

// 21y13v8L5bo3bN2co1cx, 2i1R

////////////////////////////////// Output: //////////////////////////////////

// [[Prototype]]: Map, {1 => 104, 2 => 168, 3 => 183, 5 => 92, 8 => 12, …}


// Decode as map obj
function decodeWidthCount(encodedStr) {

    // Split the string into alternating numbers and base52 encoded strings
    const parts = encodedStr.match(/\d+|[a-zA-Z]+/g);
    //console.log(parts) // (14) ['1', 'ca', '2', 'dm', '3', 'dB', '5', 'bO', '8', 'm', '13', 'f', '21', 'L']

    // Decode each base52 encoded string to a decimal number
    // インデックスiを2で割った余りが1と等しい = 2で割り切れるない= 奇数 の場合に要素を取得し デコードする
    const decodedParts = parts.filter((_, i) => i % 2 === 1).map(part => base52Decode(part));
   //console.log('decodedParts: ', decodedParts) // Array(7) [ 104, 168, 183, 92, 12, 5, 37 ]

    // Set the numbers and decoded strings into Map object
    // 配列のインデックス番号が2で割り切れる = 偶数 [0],[2],... の場合に 'width'要素を取得し キーとする
    const decodedMapObj = new Map(parts.filter((_, i) => i % 2 === 0).map((part, i) => [parseInt(part), decodedParts[i]]));

    return decodedMapObj

}

