export
{ roundToTwoDecimals, roundToOneDecimal, toFixedTrimmed}
function roundToTwoDecimals(num) {return Math.round(num * 100) / 100}
function roundToOneDecimal(num) {return Math.round(num * 10) / 10}
function toFixedTrimmed(num) {return Number.parseFloat(num.toFixed(2))}