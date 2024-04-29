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


// Round to two decimal places via '.toFixed(2)'
// Delete '.00' if could via Number.parseFloat()
// For simplify the viewBox value like the case of 'Squircle, slimmed' and 'Width narrowness: 0'
//   - Before: viewBox="0.00 0 31.00 31"
//   - After : viewBox="0 0 31 31"
function toFixedTrimmed(num) {
    return Number.parseFloat(num.toFixed(2))
    // return num.toFixed(2).replace(/\.00$/, '');
}


