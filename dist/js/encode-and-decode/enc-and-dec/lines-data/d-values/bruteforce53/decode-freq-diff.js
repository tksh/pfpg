import { base52DecodeForFreqDiff } from 'enc-and-dec/base-n/base-52-dec'
export function decodeFreqDiff(diffStr) {if (!diffStr) {return []}
const chunks = []
let i = 0
while (i < diffStr.length) {if (diffStr[i] === '_') {let underscoreCount = 0
while (diffStr[i] === '_' && i < diffStr.length) {underscoreCount++
i++}
chunks.push(diffStr.slice(i, i + underscoreCount + 2))
i += underscoreCount + 2} else {chunks.push(diffStr.slice(i, i + 2))
i += 2}}
return chunks.map(chunk => base52DecodeForFreqDiff(chunk))}