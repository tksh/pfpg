// Get back original relative values from diff

function diffToRel(diffArray) {
    // 元の値の配列を格納するための変数
    let originalArray = [];

    // 差分を取った配列に対してforEachメソッドを呼び出す
    diffArray.forEach((diff, index) => {
        // 各要素（差分）に対して処理を行う
        // ここでは、インデックスが0（最初）の場合だけ何らかの処理（例えば0と足す）を行い、
        // そうでない場合は前の要素と差分を足す処理を行っています
        if (index === 0) {
            //console.log('if (index === 0): index diff', index, diff)
            let original = diff + 0; // 最初の要素に対する処理
            // 元の値を元の配列に追加する
            originalArray.push(original);
        } else {
            let original = originalArray[index - 1] + diff;
            //console.log('typeof(diff), typeof(original), diff, original: ', typeof(diff), typeof(original), diff, original)
            // 元の値を元の配列に追加する
            originalArray.push(original);
        }
    });

    //console.log('originalArray: ', originalArray)
    return originalArray;
}