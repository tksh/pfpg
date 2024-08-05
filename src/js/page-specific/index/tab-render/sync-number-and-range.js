export
  { syncWidthNum
  , adjustWidthNum
  }

// `Width pixel size:` value sync between `number` and `range`
function syncWidthNum(element) {
  const id = element.id;                             // 入力された要素のidを取得
  const value = element.value;                       // 入力された要素の値を取得
  const targetId = id === "png-size-number" ? "png-size-range" : "png-size-number";                            // idによって対応する要素を決める
  const target = document.getElementById(targetId);  // 対応する要素を取得
  target.value = value;                              // 対応する要素の値を入力された要素の値と同じにする
}

// Adjust `Width pixel size:` value by step with '-' or '+' buttons
function adjustWidthNum(step) {
  const rangeInput = document.getElementById("png-size-range");
  const numberInput = document.getElementById("png-size-number");
  const currentValue = parseInt(rangeInput.value, 10);
  const newValue = currentValue + (step * rangeInput.step);
  if (newValue >= rangeInput.min && newValue <= rangeInput.max) {
      rangeInput.value = newValue;
      numberInput.value = newValue;
      syncWidthNum(rangeInput);                     // 同期を強制的に行う
      return newValue                               // 新しい値を返す
  }
  return null                                       // 範囲外の場合はnullを返す
}
