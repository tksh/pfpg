// Get the number of stroke colors to add multiple event listener
// via addEventListenerForGroupColorsInputs()
export function getNumberOfGroups(inputSvg: string): number {
  // 正規表現パターンを作成
  const pattern = /<g[^>]*stroke=[^>]*>/g; // <g (id="0") stroke="..." ... > にマッチするパターン

  // パターンにマッチする部分をすべて探す
  const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
  console.log(
    'matches like <g (id="0") stroke="rgb(0 0 0)|#000000" ... >: ',
    matches,
  );
  // e.g.: Array(3) [ '<g id="0" stroke="rgb(170 170 170)" opacity="1.0" stroke-opacity="1.0">', '<g id="1" stroke="rgb(0 0 0)" opacity="1.0" stroke-opacity="1.0">',

  // マッチした部分の数を取得
  const numberOfGroups = matches?.length ?? 0; // 配列の長さでマッチした部分の数を得る
  //console.log('typeof(numberOfGroups): ', typeof (numberOfGroups)) // number

  return numberOfGroups;
}
