// For group-colors
//   Input 10 or 5 chars hex
//   Remove 'FFFF' or 'FF' if at end
//   10 => 6 or 5 => 3

export function tryDeleteFs(hex: string): string | undefined {

    hex = hex.toUpperCase()

    if (hex.length !== 10 && hex.length !== 5) {
        console.error('Invalid length hex for "Group colors":', hex)
    }
    // 10 => 6
    else if (hex.length === 10 && hex.slice(-4) === "FFFF") {
        return hex.slice(0, 6)
    }
    // 5 => 3
    else if (hex.length === 5 && hex.slice(-2) === "FF") {
        return hex.slice(0, 3)
    }
    else {
        return hex
    }
}

// Test
// console.log(tryDeleteFs("abcff"))       // ABC
// console.log(tryDeleteFs("ABCFF"))       // ABC
// console.log(tryDeleteFs("abcde"))       // ABCDE
// console.log(tryDeleteFs("12345"))       // 12345
// console.log(tryDeleteFs("123456ffff"))  // 123456
// console.log(tryDeleteFs("123456abff"))  // 123456ABFF
// console.log(tryDeleteFs("1234567abff")) // Invalid length hex for "Group colors": 1234567ABFF
