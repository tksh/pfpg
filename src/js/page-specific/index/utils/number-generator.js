// For 'Opacity steps'

// Get the strings of incremental numbers for selector option value
export function numbersIncrementByStep(step) {
    let numbers = [];
    // 0から100までの整数を (step * 100)の間隔で 配列に格納
    for (let i = 0; i <= 100; i += step * 100) {
        // 整数を100で割って小数に戻す
        numbers.push((i / 100));
    }
    return zeroAndOneAsFloat(numbers.reverse()) // `.reverse()`で 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
//console.log(numbersIncrementByStep(0.04))
//console.log(numbersIncrementByStep(0.1))
//console.log(numbersIncrementByStep(0.2))
// (26) [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4, 0.36, 0.32, 0.28, 0.24, 0.2, 0.16, 0.12, 0.08, 0.04, 0]
// (11) [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
//  (6) [1, 0.8, 0.6, 0.4, 0.2, 0]


// From: [1, 0.8, 0.6, 0.4, 0.2, 0]
// To:   [1.0, 0.8, 0.6, 0.4, 0.2, 0.0]
function zeroAndOneAsFloat(numArray) {
    return numArray.map(num => {
        if (num === 0 || num === 1) {
            return num.toFixed(1);
        } else {
            return num.toString();
        }
    });
}