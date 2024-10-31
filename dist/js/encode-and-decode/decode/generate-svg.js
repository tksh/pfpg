import { isNonEmpty } from 'common-utils/is-non-empty'
import { TAB_SPACE } from 'constants'
export function generateSvg(isRelative, decodedParams) {const tagsBeforeStrokes = generateTagsBeforeStrokes(decodedParams.basicData, decodedParams.sizeData)
const tagsAfterStrokes = generateTagsAfterStrokes()
const gTagOpenByGroups = generateGTagOpenByGroups(decodedParams.linesData)
const gTagCloseByGroups = generateGTagCloseByGroups(decodedParams.linesData)
const pathTagsByGroups = generatePathTags(isRelative,decodedParams.linesData)
const strokesTags = mergeGAndPathTags(decodedParams.linesData,gTagOpenByGroups,pathTagsByGroups,gTagCloseByGroups)
const wholeSvgTags = [...tagsBeforeStrokes, ...strokesTags, ...tagsAfterStrokes]
return wholeSvgTags.join('\n')}
function generateRelPathTags(linesDataMap) {const relPathTagsByGroups = new Map()
for (let [gId, v] of linesDataMap) {const dvalsObj = v.relDvalsObj
const widths = v.widthsAndCounts.widths
const firstlineIndices = v.widthsAndCounts.firstlineIndices
const lastlineIndices = v.widthsAndCounts.lastlineIndices
let pathTagUnderGroup = []
for (let i = 0; i < widths.length; i++) {const width = widths[i]
const firstlineIndex = firstlineIndices[i] - 1
const lastlineIndex = lastlineIndices[i] - 1
const pathTagOpenWithWidth = TAB_SPACE.repeat(3) + `<path stroke-width="${width}" d="`
const pathTagClose = '" />'
let pathTagDval = ""
for (let i = firstlineIndex; i <= lastlineIndex; i++) {let eachDval = `m${dvalsObj.x1[i]} ${dvalsObj.y1[i]} ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}`
eachDval = eachDval.replace(/ -/g, '-')
pathTagDval += eachDval}
const pathTag = pathTagOpenWithWidth + pathTagDval + pathTagClose
pathTagUnderGroup.push(pathTag)}
const wholeTagsUnderGroup = pathTagUnderGroup.join('\n')
relPathTagsByGroups.set(gId, wholeTagsUnderGroup)}
return relPathTagsByGroups}
function generateAbsPathTags(linesDataMap) {const absPathTagsByGroups = new Map()
for (let [gId, v] of linesDataMap) {const dvalsObj = v.absDvalsObj
const widths = v.widthsAndCounts.widths
const firstlineIndices = v.widthsAndCounts.firstlineIndices
const lastlineIndices = v.widthsAndCounts.lastlineIndices
let gAndPathTagsUnderGroup = []
for (let i = 0; i < widths.length; i++) {const width = widths[i]
const firstlineIndex = firstlineIndices[i] - 1
const lastlineIndex = lastlineIndices[i] - 1
const widthGTagOpen = TAB_SPACE.repeat(3) + `<g stroke-width="${width}">`
const widthGTagClose = TAB_SPACE.repeat(3) + '</g>'
let eachWidthTags = [widthGTagOpen]
for (let i = firstlineIndex; i <= lastlineIndex; i++) {let pathTag =
TAB_SPACE.repeat(4) +
`<path d="M ${dvalsObj.x1[i]} ${dvalsObj.y1[i]} L ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}" />`
eachWidthTags.push(pathTag)}
eachWidthTags.push(widthGTagClose)
gAndPathTagsUnderGroup.push(eachWidthTags.join('\n'))}
const wholeTagsUnderGroup = gAndPathTagsUnderGroup.join('\n')
absPathTagsByGroups.set(gId, wholeTagsUnderGroup)}
return absPathTagsByGroups}
function generateTagsBeforeStrokes(basicDataObj, sizeDataObj) {const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sizeDataObj.viewbox}" shape-rendering="crispEdges">`
const optionalTags = [{ tag: 'title', content: basicDataObj.title },{ tag: 'desc', content: basicDataObj.desc },{ tag: 'metadata', content: addNewlineAndIndentation(basicDataObj.metadata) },].filter(({ content }) => isNonEmpty(content))
.map(({ tag, content }) => TAB_SPACE.repeat(1) + `<${tag}>${content}</${tag}>`)
const trimmingShapeDefs =
TAB_SPACE.repeat(1) + '<defs>' + '\n' +
TAB_SPACE.repeat(2) + '<clipPath id="shape-to-trim">' + '\n' +
TAB_SPACE.repeat(3) + '<rect width="100%" height="100%" />' + '\n' +
TAB_SPACE.repeat(2) + '</clipPath>' + '\n' +
TAB_SPACE.repeat(1) + '</defs>'
const clipPathGroupOpen = TAB_SPACE.repeat(1) + '<g clip-path="url(#shape-to-trim)">'
return [svgOpen, ...optionalTags, trimmingShapeDefs, clipPathGroupOpen]}
function addNewlineAndIndentation(inputLines) {if (!isNonEmpty(inputLines)) {return undefined}
let lines = typeof inputLines === 'string' ? inputLines.split('\n') : inputLines
const indentedLines = lines.map(line => `${TAB_SPACE.repeat(2)}${line}`)
const result = `\n${indentedLines.join('\n')}\n${TAB_SPACE.repeat(1)}`
return result}
function generateTagsAfterStrokes() {const clipPathGroupClose = TAB_SPACE.repeat(1) + '</g>'
const svgClose = '</svg>'
return [clipPathGroupClose, svgClose]}
function generateGTagOpenByGroups(linesDataMap) {const gTagOpenByGroups = new Map()
for (let [gId, v] of linesDataMap) {const groupColors = v.groupColors
const colorGroupTagOpen = TAB_SPACE.repeat(2)
+ `<g stroke="${groupColors.gStrokeRgbStr}" opacity="${groupColors.gOpacity}" stroke-opacity="${groupColors.gStrokeOpacity}">`
gTagOpenByGroups.set(gId, colorGroupTagOpen)}
return gTagOpenByGroups}
function generateGTagCloseByGroups(linesDataMap) {const gTagCloseByGroups = new Map()
for (let [gId, v] of linesDataMap) {const colorGroupTagClose = TAB_SPACE.repeat(2) + '</g>'
gTagCloseByGroups.set(gId, colorGroupTagClose)}
return gTagCloseByGroups}
function generatePathTags(isRelative, linesDataMap) {if (isRelative === true) {return generateRelPathTags(linesDataMap)} else if (isRelative === false) {return generateAbsPathTags(linesDataMap)}}
function mergeGAndPathTags(linesDataMap, gTagOpenByGroups, pathTagsByGroups, gTagCloseByGroups) {const gId = linesDataMap.keys()
let strokesTags = []
for (let id of gId) {strokesTags.push(gTagOpenByGroups.get(id))
strokesTags.push(pathTagsByGroups.get(id))
strokesTags.push(gTagCloseByGroups.get(id))}
return strokesTags}