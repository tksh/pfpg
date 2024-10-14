import { decodeUrlParams } from 'common-utils/read-url-params'
export
{ getInitialOpacitySteps, calculateStepsFromTwoOpacities}
function getInitialOpacitySteps() {const decodedLinesByGroups = decodeUrlParams().linesData
return calculateStepsFromTwoOpacities(decodedLinesByGroups)}
function calculateStepsFromTwoOpacities(dataByGroups) {const opArr = [...dataByGroups.values()].map(data => data.groupColors.gOpacity)
const soArr = [...dataByGroups.values()].map(data => data.groupColors.gStrokeOpacity)
const opNumArray = opArr.map(value => Number(value))
const soNumArray = soArr.map(value => Number(value))
const opLargestStep = findLargestStep(opNumArray)
const soLargestStep = findLargestStep(soNumArray)
const steps = Math.min(opLargestStep, soLargestStep)
return steps}
function findLargestStep(numberArray) {const intValues = numberArray.map(v => Math.round(v * 100))
let maxStep = 0.2
let currentGCD = 0
for (let i = 0; i < intValues.length; i++) {if (intValues[i] % 20 === 0) {currentGCD = gcd(currentGCD, 20)}
else if (intValues[i] % 10 === 0) {currentGCD = gcd(currentGCD, 10)}
else if (intValues[i] % 4 === 0) {currentGCD = gcd(currentGCD, 4)}}
if (currentGCD === 20) {maxStep = 0.2} else if (currentGCD === 10) {maxStep = 0.1} else if (currentGCD === 4) {maxStep = 0.04}
return maxStep}
function gcd(a, b) {while (b !== 0) {[a, b] = [b, a % b]}
return Math.abs(a)}