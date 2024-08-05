// Get the number of stroke colors to add multiple event listener
// via addEventListenerForGroupColorsInputs()
export function getNumberOfGroups(inputSvg) {
    // 正規表現パターンを作成
    const pattern = /g stroke="[^"]*"/g; // g stroke="..." にマッチするパターン
    // パターンにマッチする部分をすべて探す
    const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
    //console.log('matches(g stroke="#XXX"): ', matches) // Array(3) [ 'g stroke="#000"', 'g stroke="#eee"', 'g stroke="#fff"' ]
    // マッチした部分の数を取得
    const numberOfGroups = matches.length; // 配列の長さでマッチした部分の数を得る
    //console.log('typeof(numberOfGroups): ', typeof (numberOfGroups)) // number
    return numberOfGroups
}
