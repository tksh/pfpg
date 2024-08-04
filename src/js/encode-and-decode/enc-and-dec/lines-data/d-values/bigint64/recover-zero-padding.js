import { findNearestMultipleOfFourX } from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'


// Function to recover the original zero-padded string
export function recoverOriginalZeroPadding(bigintAsStr, digitsPerChunk) {
    // Log the length of the input string
    console.log("Input string length:", bigintAsStr.length);

    // Calculate the nearest multiple of four times the number of digits per chunk
    const originalPaddedLength = findNearestMultipleOfFourX(bigintAsStr.length, digitsPerChunk);
    console.log("Calculated padded length:", originalPaddedLength);

    // Check if the input string is already correctly padded
    if (bigintAsStr.length === originalPaddedLength) {
        console.log('No recovery needed; the string is already correctly padded.');
        return bigintAsStr;
    } else {
        // Pad the input string with zeros to match the calculated padded length
        return bigintAsStr.padStart(originalPaddedLength, '0');
    }
}
