export const BASIC_DATA_KEYS = ['n','version','title','desc','metadata','colors']
export const tabSpace = '\u0020\u0020\u0020\u0020'
export const VIEWBOX_START_X = 0
export const VIEWBOX_START_Y = 0
export const flagsMap = new Map([['1st', new Map([['uncompressed', '~'],['URLCompressor', '0'],['deflateRaw', '1'],])],['2nd', new Map([['bruteforce53', '0'],['bigint64', '1'],['swap63', '2'],['four16', '3'],])]])
const reverse1st = new Map()
flagsMap.get('1st').forEach((value, key) => {reverse1st.set(value, key)})
flagsMap.set('rev_1st', reverse1st)
const reverse2nd = new Map()
flagsMap.get('2nd').forEach((value, key) => {reverse2nd.set(value, key)})
flagsMap.set('rev_2nd', reverse2nd)
export const encodingMethodAndConfig = new Map([['bruteforce53', 'baseXNumber'],['bigint64', 'digitsPerChunk'],['swap63', 'swap53HasNoConfigValue'],['four16', 'four16HasNoConfigValue'],])
export const resultInfo = new Map()
export const SETTINGS_DEFAULTS = new Map([['removeOpacity', false],['removeLineBreaks', false],['removeSpaces', false],['groupColors', undefined],['pathMode', 'absoluteSeparated'],['opacitySteps', undefined],['colorFormat', 'rgb'],['shapeToTrim', 'square'],['widthNarrowness', 10],['topHeavyRatio', 1],['cropSideMargins', false],['shapeRendering', 'crispEdges'],['widthPixelSize', 256],['viewScaling', 'fit'],['checkerboardBg', true],['textWrapping', true],['buttonAction', 'download'],['themeColor', undefined],])