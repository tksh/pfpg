import { outputToTextarea } from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { showProcessingTime } from 'common-utils/show-processing-time'
import { flagsMap, resultInfo} from 'constants'
import { zip } from 'libs/deno-std/zip'
export
{ showResult, showStringSize, showDetailsByGroups}
function showResult(encodingMethodName, startTime, encodedStrJoined, encodedArrByGroups) {const inputDataTitle = `Lines Data encoding via '${encodingMethodName}Enc()'`
outputToTextarea(encodedStrJoined, 'textarea-lines-data-encoded')
showStringSize(inputDataTitle, encodedStrJoined, 'encoded-lines-data-size')
const endTime = performance.now()
const elapsedTime = Math.floor(endTime - startTime)
showProcessingTime(`${encodingMethodName}Enc()`, elapsedTime, 'encoded-lines-data-time', isOnDataManipulatorPage())
showDetailsByGroups(encodedArrByGroups, encodingMethodName)}
function showStringSize(inputDataTitle, inputStr, outputElemId) {const outputTextElem = document.getElementById(`${outputElemId}`)
outputTextElem.textContent = `Result length of ${inputDataTitle}: ${inputStr.length} characters (bytes)`}
function showDetailsByGroups(encodedArrByGroupsMap, encodingMethodName) {const keys = [...encodedArrByGroupsMap.keys()]
const values = [...encodedArrByGroupsMap.values()]
const groupColors = values.map((value) => value[0].split('=')[0])
const lengthOfValues = values.map((value) => value[0].length)
const configValue = values.map((value) => value[2])
const flagsByGroups = resultInfo.get(`${encodingMethodName} Flags`)
const flagsByKinds = zip(...Array.from(flagsByGroups))
const flag1 = flagsByKinds[0]
const flag2 = flagsByKinds[1]
const flag1Name = flag1.map(char => flagsMap.get('rev_1st').get(`${char}`))
const flag2Name = flag2.map(char => flagsMap.get('rev_2nd').get(`${char}`))
return new Map([['gId', keys],['colors', groupColors],['length', lengthOfValues],['flags', flagsByGroups],['flag1', flag1],['flag2', flag2]])}