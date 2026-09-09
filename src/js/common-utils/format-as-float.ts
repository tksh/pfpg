export
    { formatAsFloatString
    , addDecimalToZeroAndOne
    }

// From: Array (6) [ 1, 0.8, 0.6, 0.4, 0.2, 0 ]
// To:   Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]
function formatAsFloatString(numArray: number[]): string[] {
    return numArray.map(num => addDecimalToZeroAndOne(num))
}

function addDecimalToZeroAndOne(num: number): string {
    if (num === 0 || num === 1) {
        return num.toFixed(1)
    } else {
        return num.toString()
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







