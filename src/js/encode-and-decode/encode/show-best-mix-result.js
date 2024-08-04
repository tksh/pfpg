import { zip } from 'decode/rel-to-abs'

// For best mix [2|3] encoding by each group
export function showBestMixResult(dataToShow, textareaId) {
    // Generate text content
    const entireGroupInfo = [];
    let totalLength = 0

    // Transpose the data as each array represents each group's result info.
    const transposed = zip(...Array.from(dataToShow.values()))
    console.log('transposed: ', transposed)
    // Array [ (7) […], (7) […] ]
    //   0: Array(7) [ 1, "0", 2458, … ]
    //   1: Array(7) [ 2, "f", 132, … ]
    //   length: 2

    // Generate the text contents of encoded result, by group.
    transposed.map(v => {
        totalLength += v[2]
        const lengthPadded = v[2].toString().padStart(5, ' ').replace(/ /g, '&nbsp;')
        entireGroupInfo.push(`&nbsp;&nbsp;g_id: ${v[0]} / length:${lengthPadded} / compressed by: ${v[4]} / encoded by: ${v[5]} `)
    })

    // Output to console
    console.log('entireGroupInfo: ', entireGroupInfo.join("\n"))

    // Output to html
    totalLength += transposed.length - 1  // Add the value of (group number - 1) for counting '&' sign chars
    const totalLengthText = 'Encoded Lines Data size: ' + totalLength + ' characters (bytes)'  // Total size
    const joined = totalLengthText + '<br>' + entireGroupInfo.join('<br>')                     // Add each group size
    const outputTextElem = document.getElementById(textareaId);
    outputTextElem.innerHTML = joined;
}
