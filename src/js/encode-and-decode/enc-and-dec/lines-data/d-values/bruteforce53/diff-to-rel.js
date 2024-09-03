// Get back original relative values from diff
export function diffToRel(diffArray) {
    // Array to store original values
    let originalArray = []

    // Iterate over the diff array
    diffArray.forEach((diff, index) => {
        console.log(`Row ${index}: ${diff} <${typeof(diff)}>`)  // Mixed <number> and <string> types

        // Process each element (diff)
        // If index is [0], perform Number() operation
        // Otherwise (index [1:end]), perform Number() operation and add to previous element

        if (index === 0) {
            let original = parseInt(diff, 10) // Process for first element
            originalArray.push(original)

        } else {
            let original = originalArray[index - 1] + parseInt(diff, 10)
            originalArray.push(original)
        }
    })
    return originalArray
}