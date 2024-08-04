import { bigint64Enc }        from 'enc-and-dec/d-values/bigint64/bigint64-enc'
import { bruteforce53Enc }    from 'enc-and-dec/d-values/bruteforce53/bruteforce53-enc'
import { swap63Enc }          from 'enc-and-dec/d-values/swap63/swap63-enc'
import { joinWithAmpersand }  from 'encode/join-with-ampersand'
import { showStringSize
       , showDetailsByGroup } from 'encode/show-result'
import { storeShorter }       from 'encode/store-shorter'


/**
 * Selects the best mix of encoding methods based on the given number of methods.
 * @param {number} numberOfMethods - The number of encoding methods to consider (2 or 3).
 */
export function bestMixFromNMethods(numberOfMethods) {
    // Read the result of whole encoding methods
    const bruteforce53Map = bruteforce53Enc(); // Bruteforce 53 encoding
    const bigint64Map = bigint64Enc();         // Bigint 64 encoding

    // Optional third method
    let swap63Map;
    if (numberOfMethods === 3) {
        swap63Map = swap63Enc(); // Swap 63 encoding
    }

    // Compare and get the shortest one by group
    let bestMixShortest;
    if (numberOfMethods === 3) {
        // When considering 3 methods, compare all three
        const firstCompareShortest = storeShorter(bruteforce53Map, bigint64Map);
        bestMixShortest = storeShorter(firstCompareShortest, swap63Map);
    } else { // numberOfMethods === 2
        // When considering 2 methods, compare just the two
        bestMixShortest = storeShorter(bruteforce53Map, bigint64Map);
    }

    // Join the shortest group strings with '&' (ampersand sign)
    const shortestJoined = joinWithAmpersand(bestMixShortest);

    // Output the joined string to a textarea
    outputToTextarea(shortestJoined, 'textarea-strokes-values-encoded');

    // Determine the prefix message based on the number of methods considered
    const messagePrefix = `Lines Data (Best mix from ${numberOfMethods} methods)`;

    // Show the size of the result in HTML and console
    showStringSize(messagePrefix, shortestJoined, 'encoded-strokes-values-size');

    // Show the details of the encoding result by group in the console
    showDetailsByGroup('Lines Data', bestMixShortest);

    // Show the details of the encoding result by group in the console, and return the data to indicate in HTML
    const dataToShow = showDetailsByGroup('Lines Data', bestMixShortest);
    showBestMixResult(dataToShow, 'encoded-strokes-values-size');

    // Clear the inaccurate processing time text
    document.getElementById('encoded-strokes-values-time').innerHTML = '';
}
