import { base52Dec } from 'enc-and-dec/base-n/base-52-dec'
import { baseXDec }  from 'enc-and-dec/lines-data/d-values/bruteforce53/base-x-dec'

export function decodeDiff(diffStr, codebook, baseX) {
    let decodedDiffArr = []
    let i = 0

    while (i < diffStr.length) {

        if (isInFreqDiff(diffStr[i], codebook)) {
            // Codebook に含まれるアルファベットならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
            // console.log(`Decode diff: isInFreqDiff = true, ${diffStr[i]} => ${codebook.get(diffStr[i])}`)
            // e.g.: Decode diff: isInFreqDiff = true, P => -1
            decodedDiffArr.push(codebook.get(diffStr[i]))
            i++

        } else if (isNumber(diffStr[i])) {
            // 整数[0-9] ならば 1文字ごとに そのまま 配列に格納
            // console.log(`Decode diff: isNumber = true, ${diffStr[i]} => ${diffStr[i]}`)
            // e.g.: Decode diff: isNumber = true, 1 => 1
            decodedDiffArr.push(parseInt(diffStr[i], 10))
            i++

        } else if (diffStr[i] === '_') {
            // '_'が １個見つかったら その次に更に '_'が何個続くか を調べて それに応じた処理をする
            let underscoreCount = 0
            while (diffStr[i] === '_' && i < diffStr.length) {
                underscoreCount++
                i++
            }

            let decodedValue
            let encodedChunk
            let encodedLength

            if (underscoreCount % 2 === 1) {                          // 奇数個のアンダースコア: 元の値は 正の数なので そのまま 配列に格納
                encodedLength = Math.floor(underscoreCount / 2) + 2
                encodedChunk = diffStr.slice(i, i + encodedLength)
                decodedValue = base52Dec(encodedChunk)
            } else {                                                  // 偶数個のアンダースコア: 元の値は 負の数なので マイナス記号を付けてから 配列に格納
                encodedLength = (underscoreCount / 2) + 1
                encodedChunk = diffStr.slice(i, i + encodedLength)
                decodedValue = -base52Dec(encodedChunk)
            }

            console.log(`'_' found: ${'_'.repeat(underscoreCount)}${encodedChunk} => ${decodedValue}`)
            decodedDiffArr.push(decodedValue)
            i += encodedLength

        } else {
            // 残りは BaseXでエンコードされた 2文字ずつ のみ なので それを baseXDec()して  配列に格納
            const toBaseXDecode = diffStr.slice(i, i + 2)
            // console.log(`Decode diff: toBaseXDecode: ${toBaseXDecode} => `, baseXDec(toBaseXDecode, baseX))
            // e.g.: Decode diff: toBaseXDecode: tG =>  -29
            decodedDiffArr.push(baseXDec(toBaseXDecode, baseX))
            i += 2
        }
    }

    return decodedDiffArr
}


// frequent diff に含まれているなら `true` を返す
function isInFreqDiff(char, codebook) {
    // 判定用文字列
    // Codebook Mapオブジェクトのキーのみを 配列として取り出し 区切り無しでjoinして ひとつの文字列にする
    const freqDiffStr = [...codebook.keys()].join('')

    // 文字 char が 判定用文字列に 含まれているかどうか を判定する => 含まれている場合は true が返る
    const bool = freqDiffStr.indexOf(char) !== -1
    return bool
}

// 文字が [0-9]かどうか を判定する
function isNumber(char) {
    return /^[0-9]+$/g.test(char)
}
