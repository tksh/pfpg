import { FLAGS_MAP } from 'constants'
import { zip } from 'libs/deno-std/zip'
export function showBestMixResult(dataToShow, textareaId) {const entireGroupInfo = [['Group ID', ' Length of string', ' Compression method', ' Encoding method']]
let totalLength = 0
const transposed = zip(...Array.from(dataToShow.values()))
transposed.map(v => {totalLength += v[2]
const compressionMethodName = FLAGS_MAP.get('rev_1st').get(`${v[4]}`)
const encodingMethodName = FLAGS_MAP.get('rev_2nd').get(`${v[5]}`)
entireGroupInfo.push(`${v[0]}, ${v[2]}, ${compressionMethodName}, ${encodingMethodName} `)})
totalLength += transposed.length - 1
const totalLengthText = 'Result length of Lines Data encoding via bestMixEnc(): ' + totalLength + ' characters (bytes)'
const detailsByGroups = 'Details by groups:'
const joined = totalLengthText + '<br><br>' + detailsByGroups + '<br>' + entireGroupInfo.join('<br>')
const outputTextElem = document.getElementById(textareaId)
outputTextElem.innerHTML = joined}