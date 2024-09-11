import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'


export function createCodebookToEnc(freqDiffArrActualCodebookSized) {

    const alphabetsActualCodebookSized = getAlphabetsForCodebook(freqDiffArrActualCodebookSized.length)
    console.log('alphabetsActualCodebookSized: ', alphabetsActualCodebookSized)
    // From 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // Set the source symbol and codeword pair into Map()
    const codebookToEncodeFreqDiff = new Map()

    // Create codebook (each coord has own size)

    for (let i = 0; i < freqDiffArrActualCodebookSized.length; i++) {
        // Mapオブジェクトに Source Symbol(頻出数値) と Codeword(置換用アルファベット) のペアを追加する
        console.log('typeof(freqDiffArrActualCodebookSized[i], alphabetsActualCodebookSized[i]), freqDiffArrActualCodebookSized[i], alphabetsActualCodebookSized[i]: ', typeof (freqDiffArrActualCodebookSized[i]), typeof (alphabetsActualCodebookSized[i]), freqDiffArrActualCodebookSized[i], alphabetsActualCodebookSized[i])
        // e.g.: number string -2 I
        codebookToEncodeFreqDiff.set(freqDiffArrActualCodebookSized[i], alphabetsActualCodebookSized[i])
    }
    return codebookToEncodeFreqDiff
}
