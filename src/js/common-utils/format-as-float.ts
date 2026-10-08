export { addDecimalToZeroAndOne, formatAsFloatString };

// From: Array (6) [ 1, 0.8, 0.6, 0.4, 0.2, 0 ]
// To:   Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]
function formatAsFloatString(numArray: number[]): string[] {
  return numArray.map((num) => addDecimalToZeroAndOne(num));
}

function addDecimalToZeroAndOne(num: number): string {
  if (num === 0 || num === 1) {
    return num.toFixed(1);
  } else {
    return num.toString();
  }
}
