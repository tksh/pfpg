// **Math.round()**メソッドだけでは、小数点第二位までを丸めることができません。そこで、数値に100をかけてから丸めて、100で割るという工夫をします。例えば、以下のように書くことができます。

// var num = 1.2345;
// var rounded = Math.round(num * 100) / 100; // 1.23

// これで、JavaScriptで小数点第二位までを表現することができます。

function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

function roundToOneDecimal(num) {
    return Math.round(num * 10) / 10;
}


// Delete '.00' if could after round to two decimal places.
// For simplify the viewBox value like the case of 'Squircle, slimmed' and 'Width narrowness: 0'
//   - Before: viewBox="0.00 0 31.00 31"
//   - After : viewBox="0 0 31 31"
function toFixedTrimmed(num) {
    return Number.parseFloat(num.toFixed(2))
    // return num.toFixed(2).replace(/\.00$/, '');
}


// For 'Opacity steps'

// Get the strings of incremental numbers for selector option value
function numbersIncrementByStep(step) {
    let numbers = [];
    // 0から100までの整数を (step * 100)の間隔で 配列に格納
    for (let i = 0; i <= 100; i += step * 100) {
        // 整数を100で割って小数に戻す
        numbers.push((i / 100));
    }
    return numbers.reverse() // 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
//console.log(numbersIncrementByStep(0.04))
//console.log(numbersIncrementByStep(0.1))
//console.log(numbersIncrementByStep(0.2))
// (26) [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4, 0.36, 0.32, 0.28, 0.24, 0.2, 0.16, 0.12, 0.08, 0.04, 0]
// (11) [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
//  (6) [1, 0.8, 0.6, 0.4, 0.2, 0]


