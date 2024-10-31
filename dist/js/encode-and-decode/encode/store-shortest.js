import { FLAGS_MAP } from 'constants'
import { resultInfo} from 'state/result-info'
export function storeShortest(encodedArrByMethods, encodingMethodNamesArr) {const shortestArrByGroups = new Map()
let flagsArr= []
for (let i = 0; i < encodedArrByMethods[0].size; i++) {const encodedArrExtractWithGroupId = encodedArrByMethods.map(encodedArr => encodedArr.get(i))
const strLengthByMethods = encodedArrExtractWithGroupId.map(str => str[0].length)
const minLength = Math.min(...strLengthByMethods)
const minIndex = strLengthByMethods.indexOf(minLength)
const methodName = encodingMethodNamesArr[minIndex]
const shortestArr = encodedArrExtractWithGroupId[minIndex]
shortestArrByGroups.set(`${i}`, shortestArr)
const charOf1stFlag = shortestArr[0].split('=')[1][0]
const charOf2ndFlag = FLAGS_MAP.get('2nd').get(methodName)
flagsArr.push([charOf1stFlag, charOf2ndFlag])}
const bestMixFlags = new Map([['flags', [...flagsArr]]])
resultInfo.set('best-mix Flags', flagsArr)
return shortestArrByGroups}