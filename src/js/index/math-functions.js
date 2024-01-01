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
