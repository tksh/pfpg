import { baseXDec }  from 'enc-and-dec/lines-data/d-values/bruteforce53/base-x-dec'
import { base52Dec } from 'enc-and-dec/base-n/base-52-dec'

// Functions to decode the diff

export function decodeDiff(diffStr, codebook, baseX) {
    let decodedDiffArr = []

    for (let i = 0; i < diffStr.length; i++) {

        if (isInFreqDiff(diffStr[i], codebook)) {
            // Codebook に含まれるアルファベットならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
            console.log(`Decode diff: isInFreqDiff = true, ${diffStr[i]} => ${codebook.get(diffStr[i])}`)
            decodedDiffArr.push(codebook.get(diffStr[i]))


        } else if (isNumber(diffStr[i])) {
            console.log(`Decode diff: isNumber    = true, ${diffStr[i]} => ${diffStr[i]}`)
            // 整数[0-9] ならば 1文字ごとに そのまま 配列に格納
            decodedDiffArr.push(diffStr[i])

        } else if (diffStr[i] == '_') {
            console.log(`Decode diff: : '_' found ...`)
            // '_'が １個見つかったら その次に更に '_'が何個続くか を調べて それに応じた処理をする
            // '_'があれば その次に続く 2文字 を Base52デコード: '_ab'
            if (diffStr[i + 1] !== '_') { // '_' が 一つしか続かない場合
                decodedDiffArr.push(base52Dec((diffStr[i + 1] + diffStr[i + 2])))
                console.log(`'_' found: ${diffStr[i] + (diffStr[i + 1] + diffStr[i + 2])} =>`, base52Dec((diffStr[i + 1] + diffStr[i + 2])))
                i += 2 // 'i' を '2'増やして '_'の後に続く 2文字分を スキップさせる
            }

            // '__'があれば その次に続く 2文字 を Base52デコード: '__ab'
            // 返ってきた 数値には マイナス記号を付ける
            if (diffStr[i + 1] === '_') { // '_' が 一つ目の後に もう一つ続く場合
                decodedDiffArr.push(-base52Dec((diffStr[i + 2] + diffStr[i + 3])))
                i += 3 // 'i' を '3'増やして '__'の後に続く 2文字分を スキップさせる
            }

            // '___'があれば その次に続く 3文字 を Base52デコード: '___abc'
            if (diffStr[i + 1] === '_' && diffStr[i + 2] === '_') {
                decodedDiffArr.push(base52Dec((diffStr[i + 3] + diffStr[i + 4] + diffStr[i + 5])))
                i += 5 // 'i' を '5'増やして '___'の後に続く 3文字分を スキップさせる
            }

            // '____'があれば その次に続く 3文字 を Base52デコード: '____abc'
            // 返ってきた 数値には マイナス記号を付ける
            if (diffStr[i + 1] === '_' && diffStr[i + 2] === '_' && diffStr[i + 3] === '_') {
                decodedDiffArr.push(-base52Dec((diffStr[i + 4] + diffStr[i + 5] + diffStr[i + 6])))
                i += 6 // 'i' を '6'増やして '____'の後に続く 3文字分を スキップさせる
            }


        } else { // 残りは BaseXでエンコードされた 小文字2文字ずつ のみ なので 2文字ずつ baseXDec()する
            const toBaseXDecode = diffStr[i] + diffStr[i + 1]
            console.log(`Decode diff: toBaseXDecode: ${toBaseXDecode} => `, baseXDec(toBaseXDecode, baseX))
            decodedDiffArr.push(baseXDec(toBaseXDecode, baseX))
            i++ // 'i' を '1'増やして 2文字目の文字分を 次のループで スキップさせる

        }
    }
    return decodedDiffArr
}



// 辞書文字列 (Reference dictionary) に含まれているなら `true` を返す
function isInFreqDiff(char, codebook) {
    // 判定用文字列
    // Mapオブジェクトのキーのみを 配列として取り出し 区切り無しでjoinして ひとつの文字列にする
    const freqDiff = [...codebook.keys()].join('')

    // 文字 char が 判定用文字列に 含まれているかどうか を判定する => 含まれている場合は true が返る
    const bool = freqDiff.indexOf(char) !== -1
    return bool
}

// 文字が [0-9]かどうか を判定する
function isNumber(char) {
    return /^[0-9]+$/g.test(char)
}
