import { flagsMap } from 'constants'
import { zip }      from 'decode/rel-to-abs'

// For best mix [2|3] encoding by each group
export function showBestMixResult(dataToShow, textareaId) {
    // Generate text content
    const entireGroupInfo = []
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
        // const lengthPadded = v[2].toString().padStart(6, ' ').replace(/ /g, '&nbsp')
        const compressionMethodName = flagsMap.get('rev_1st').get(`${v[4]}`)  // flag => name
        const encodingMethodName    = flagsMap.get('rev_2nd').get(`${v[5]}`)  // flag => name
        entireGroupInfo.push(`${v[0]}, ${v[2]}, ${compressionMethodName}, ${encodingMethodName} `)
        // entireGroupInfo.push(`&nbsp&nbsp;g_id: ${v[0]} / length:${lengthPadded} / compressed by: ${compressionMethodName} / encoded by: ${encodingMethodName} `)
    })

    // Output to console
    entireGroupInfo.forEach(groupInfo => {
        console.log('groupInfo: ', groupInfo)
    })

    // Output to html
    totalLength += transposed.length - 1  // Add the value of (group number - 1) for counting '&' sign chars
    const totalLengthText = 'Encoded Lines Data size: ' + totalLength + ' characters (bytes)'  // Total size
    const detailsByGroups = 'Details by group(id, length, compressed by, encoded by):'  // Total size
    const joined = totalLengthText + '<br><br>' + detailsByGroups  + '<br>' + entireGroupInfo.join('<br>')
    const outputTextElem = document.getElementById(textareaId)
    outputTextElem.innerHTML = joined
}
