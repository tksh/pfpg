// For Bigint64 Decoding

// 絶対座標データの配列を相対座標データの配列に変換する関数

export function absToRel(arr) {
    // 結果を格納する空の配列を作る
    let result = [];
    // 前の要素の x2, y2 を記録する変数を初期化する
    let prevX2 = 0;
    let prevY2 = 0;
    // 引数の配列の要素を一つずつ処理する
    for (let i = 0; i < arr[0].length; i++) {
        // 現在の要素の x1, y1, x2, y2 を取り出す
        let x1 = arr[0][i];
        let y1 = arr[1][i];
        let x2 = arr[2][i];
        let y2 = arr[3][i];
        // 最初の要素の場合
        if (i === 0) {
            // x1, y1 は絶対値をそのまま使う
            // x2, y2 は x1, y1 からの差分を求める
            result[0] = [x1, y1, x2 - x1, y2 - y1];
        } else {
            // 二つ目以降の要素の場合
            // x1, y1 は前の要素の x2, y2 からの差分を求める
            // x2, y2 は現在の要素の x1, y1 からの差分を求める
            result[0].push(x1 - prevX2, y1 - prevY2, x2 - x1, y2 - y1);
        }
        // 前の要素の x2, y2 を更新する
        prevX2 = x2;
        prevY2 = y2;
    }
    // 結果を x1, y1, x2, y2 ごとに分割する
    result[1] = result[0].filter((_, index) => index % 4 === 0); // x1
    result[2] = result[0].filter((_, index) => index % 4 === 1); // y1
    result[3] = result[0].filter((_, index) => index % 4 === 2); // x2
    result[4] = result[0].filter((_, index) => index % 4 === 3); // y2
    // 結果の配列のインデックス 0 を削除する
    result.shift();
    // 結果を返す
    return result;
}

// Test

// 絶対座標データの配列
// const absoluteDvalsay = [
//     [10, 90, 90, 10], // x1
//     [10, 10, 90, 90], // y1
//     [90, 90, 10, 10], // x2
//     [10, 90, 90, 10]  // y2
// ];

// 関数 absToRel で相対座標データの配列に変換する
// const relativeDvalsay = absToRel(absoluteDvalsay);

// 結果
// console.log(relativeDvalsay);
// (4) [Array(4), Array(4), Array(4), Array(4)]
//     0: (4) [10, 0, 0, 0]   // x1
//     1: (4) [10, 0, 0, 0]   // y1
//     2: (4) [80, 0, -80, 0] // x2
//     3: (4) [0, 80, 0, -80] // y2
