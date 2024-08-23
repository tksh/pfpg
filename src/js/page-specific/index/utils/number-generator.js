// For 'Opacity steps'

// Get the strings of incremental numbers for selector option value
export function numbersIncrementByStep(step) {
    let numbers = [];
    // 0から100までの整数を (step * 100)の間隔で 配列に格納
    for (let i = 0; i <= 100; i += step * 100) {
        // 整数を100で割って小数に戻す
        numbers.push((i / 100));
    }
    return formatAsFloatString(numbers.reverse()) // `.reverse()`で 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
// console.log(numbersIncrementByStep(0.04))
// console.log(numbersIncrementByStep(0.1))
// console.log(numbersIncrementByStep(0.2))
// Array(26) [ "1.0", "0.96", "0.92", "0.88", "0.84", "0.8", "0.76", "0.72", "0.68", "0.64", … "0.0" ]
// Array(11) [ "1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", … "0.0" ]
// Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]


// From: Array (6) [ 1, 0.8, 0.6, 0.4, 0.2, 0 ]
// To:   Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]
function formatAsFloatString(numArray) {
    return numArray.map(num => addDecimalToZeroAndOne(num));
}

function addDecimalToZeroAndOne(num) {
    if (num === 0 || num === 1) {
        return num.toFixed(1);
    } else {
        return num.toString();
    }
}

// console.log(typeof(addDecimalToZeroAndOne(1)))  // string
// console.log(addDecimalToZeroAndOne(1))          // 1.0
// console.log(addDecimalToZeroAndOne(0))          // 0.0
// console.log(addDecimalToZeroAndOne(1.0))        // 1.0
// console.log(addDecimalToZeroAndOne(0.0))        // 0.0
// console.log(addDecimalToZeroAndOne(1.00))       // 1.0
// console.log(addDecimalToZeroAndOne(0.00))       // 0.0
// console.log(addDecimalToZeroAndOne(0.5))        // 0.5







