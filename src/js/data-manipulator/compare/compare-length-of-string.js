// Compare the length of string between before and after URLComp applied

function compareLengthOfString(groupId, before, after) {
    if (before.length > after.length) {
        // before の方が長い場合 = URLCompressor が効果的である場合
        console.log(`URLCompressor is effective for group #${groupId}, should be applied it:`, before.length, '=>', after.length)
        return true;
    } else {
        // before の方が短いか 同じ 場合 = URLCompressor が効果的ではない場合
        // URLCompressor を適用しないままのものを採用する
        console.log(`URLCompressor is not effective for group #${groupId}, should be passed it:`, before.length, '=>', after.length)
        return false;
    }
}