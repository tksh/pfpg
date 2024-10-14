import { VIEWBOX_START_X, VIEWBOX_START_Y} from 'constants'
export
{ sizeDataDec, calculateCanvasSize}
function sizeDataDec(linesDataMapIndexZero) {const absDvalsObj = linesDataMapIndexZero.absDvalsObj
let sizeDataObj = calculateCanvasSize(absDvalsObj)
const viewboxStr = `${VIEWBOX_START_X} ${VIEWBOX_START_Y} ${sizeDataObj.width} ${sizeDataObj.height}`
sizeDataObj = { viewbox: viewboxStr, ...sizeDataObj }
return sizeDataObj}
function calculateCanvasSize(d) {let width, height
if (d.x1.length === 2) {if (d.x1[0] === d.x2[0]) {width = d.x1[0] + d.x1[1]
height = d.y1[0] + d.y2[0]}
else if (d.y1[0] === d.y2[0]) {width = d.y1[0] + d.y1[1]
height = d.x1[0] + d.x2[0]}}
else if (d.x1.length === 1) {if (d.x1[0] === d.x2[0]) {width = d.y1[0] + d.y2[0]
height = d.x1[0] + d.x2[0]}
else if (d.y1[0] === d.y2[0]) {width = d.x1[0] + d.x2[0]
height = d.y1[0] + d.y2[0]}}
else {console.error("Invalid coordinates.")}
return { width, height }}