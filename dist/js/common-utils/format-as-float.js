export
{ formatAsFloatString, addDecimalToZeroAndOne}
function formatAsFloatString(numArray) {return numArray.map(num => addDecimalToZeroAndOne(num))}
function addDecimalToZeroAndOne(num) {if (num === 0 || num === 1) {return num.toFixed(1)} else {return num.toString()}}