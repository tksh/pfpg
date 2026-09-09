export { adjustInputValueViaButton, syncInputNumberAndRange };

// `Height pixel size:` value sync between `number` and `range`
function syncInputNumberAndRange(element: HTMLInputElement): void {
  const id = element.id; // 入力された要素のidを取得
  const value = element.value; // 入力された要素の値を取得
  const targetId = id === "png-size-number"
    ? "png-size-range"
    : "png-size-number"; // idによって対応する要素を決める
  const target = document.getElementById(targetId); // 対応する要素を取得
  if (!target) throw new Error(`Element '${targetId}' not found`);
  (target as HTMLInputElement).value = value; // 対応する要素の値を入力された要素の値と同じにする
}

// Adjust `Height pixel size:` value by step with '-' or '+' buttons
function adjustInputValueViaButton(step: number): number | null {
  const rangeInput = document.getElementById("png-size-range");
  if (!rangeInput) throw new Error("Element 'png-size-range' not found");
  const numberInput = document.getElementById("png-size-number");
  if (!numberInput) throw new Error("Element 'png-size-number' not found");
  const rangeElement = rangeInput as HTMLInputElement;
  const numberElement = numberInput as HTMLInputElement;
  const currentValue = parseInt(rangeElement.value, 10);
  const newValue = currentValue + (step * Number(rangeElement.step));
  if (
    newValue >= Number(rangeElement.min) && newValue <= Number(rangeElement.max)
  ) {
    rangeElement.value = String(newValue);
    numberElement.value = String(newValue);
    syncInputNumberAndRange(rangeElement); // 同期を強制的に行う
    return newValue; // 新しい値を返す
  }
  return null; // 範囲外の場合はnullを返す
}
