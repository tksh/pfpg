// For Bigint64 Decoding

// 絶対座標データの配列を相対座標データの配列に変換する関数

export function absToRel(absoluteDvals, widthAndCounts) {
    // Get the firstline indices of each stroke-width in this group
    const firstlineArr      = widthAndCounts.firstline      // e.g.: Arr(4) [ 1, 4, 8, 25 ]
    const firstlineIndexArr = firstlineArr.map(n => n - 1)  // e.g.: Arr(4) [ 0, 3, 7, 24 ]

    // Initialize
    const temp = []
    let prevX2 = 0, prevY2 = 0  // 直前の要素の x2, y2 を記録する変数を初期化する

    const [x1Arr, y1Arr, x2Arr, y2Arr] = absoluteDvals
    let x1, y1, x2, y2

    // Processing each coordinates
    for (let i = 0; i < x1Arr.length; i++) {
        x1 = x1Arr[i]
        y1 = y1Arr[i]
        x2 = x2Arr[i]
        y2 = y2Arr[i]

        if (firstlineIndexArr.includes(i)) {
            // 各 stroke-width の最初の要素の場合
            // x1, y1 は 絶対値をそのまま使う
            // x2, y2 は x1, y1 からの差分を求める
            temp.push(x1, y1, x2 - x1, y2 - y1)
        } else {
            // 各 stroke-width の二つ目以降の要素の場合
            // x1, y1 は直前の要素の x2, y2 からの差分を求める
            // x2, y2 は現在の要素の x1, y1 からの差分を求める
            temp.push(x1 - prevX2, y1 - prevY2, x2 - x1, y2 - y1)
        }

        prevX2 = x2
        prevY2 = y2
    }

    // Return the result after splitted as x1, y1, x2, y2
    return [
        Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4]),      // x1
        Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 1]),  // y1
        Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 2]),  // x2
        Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 3])   // y2
    ]
}
