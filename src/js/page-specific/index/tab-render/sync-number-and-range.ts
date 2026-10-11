export { adjustInputValueViaButton, syncInputNumberAndRange };

// Every `<number>` input in the app is paired with a `<range>` slider belonging
// to the same control: `#png-size-number` with `#png-size-range`,
// `#chroma-number` with `#chroma-range`, and so on. Each pair also shares a
// `-`/`+` button pair. Finding the partner from the id suffix is what lets one
// implementation serve all of them.

// Value sync between a `<number>` input and its paired `<range>` slider
function syncInputNumberAndRange(element: HTMLInputElement): void {
  const id = element.id;
  const value = element.value;
  const targetId = pairedControlId(id);
  const target = document.getElementById(targetId);
  if (!target) throw new Error(`Element '${targetId}' not found`);
  (target as HTMLInputElement).value = value; // 対応する要素の値を入力された要素の値と同じにする
}

// Adjust a `<number>`/`<range>` pair by one step with its '-' or '+' button.
// The pair is named by its common prefix, e.g. "png-size" or "chroma".
function adjustInputValueViaButton(
  prefix: string,
  step: number,
): number | null {
  const rangeElement = getControlInput(`${prefix}-range`);
  const numberElement = getControlInput(`${prefix}-number`);
  // parseFloat, not parseInt: the step is fractional for the color
  // randomization ranges, and parseInt would collapse 0.1 to 0.
  const currentValue = parseFloat(rangeElement.value);
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

// The id of the other half of a control pair: 'X-number' <-> 'X-range'.
function pairedControlId(id: string): string {
  const suffix = id.endsWith("-number") ? "-number" : "-range";
  return `${id.slice(0, -suffix.length)}${
    suffix === "-number" ? "-range" : "-number"
  }`;
}

function getControlInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element '${id}' not found`);
  return element as HTMLInputElement;
}
