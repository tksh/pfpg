import { getSvgString } from "button/download-as-file";
import { commitRender } from "state/render-commit";
import { updateState } from "state/url-state-manager";
import { getGroupColorsValues } from "libpfpg/group-colors";
import { numbersIncrementByStep } from "libpfpg/opacity-steps";

export {
  changeOpacitySelectOptionsAsNewStep,
  getElementValueById,
  initOpacityStepsSelect,
};

// Event listeners for 'Opacity steps' value changes
function initOpacityStepsSelect(): void {
  const opacityStepsSelect = document.getElementById("opacity-steps");
  if (opacityStepsSelect === null) {
    throw new Error(
      "initOpacityStepsSelect: element not found: #opacity-steps",
    );
  }
  opacityStepsSelect.addEventListener("change", (event: Event) => {
    // 選択されたセレクトメニューの値を取得
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      throw new Error(
        "initOpacityStepsSelect: expected select element for #opacity-steps",
      );
    }
    const opacitySteps = Number(target.value); // 0.04 | 0.1 | 0.2

    // グローバルステート更新
    updateState("opacitySteps", opacitySteps);

    // 新しい <option> のリストで各ピッカーを作り直す
    // （ピッカーの値は SVG とは独立した表示）
    changeOpacitySelectOptionsAsNewStep(
      getSvgString(),
      opacitySteps,
    );

    commitRender();
  });
}

// 'opacity' and 'stroke-opacity' values of entire groups will be changed as selected new steps.
function changeOpacitySelectOptionsAsNewStep(
  svgString: string,
  opacitySteps: number,
  svg2pngOption?: { height: number },
): void {
  const groupColorsValues = getGroupColorsValues(svgString);
  const numberOfGroupsValue = groupColorsValues.get("number_of_groups");
  if (typeof numberOfGroupsValue !== "number") {
    throw new Error(
      "changeOpacitySelectOptionsAsNewStep: missing number_of_groups",
    );
  }
  const numberOfGroups = numberOfGroupsValue;
  const opacityValues = groupColorsValues.get("opacity_array");
  if (!Array.isArray(opacityValues)) {
    throw new Error(
      "changeOpacitySelectOptionsAsNewStep: missing opacity_array",
    );
  }
  const opacity = opacityValues;
  const strokeOpacityValues = groupColorsValues.get("stroke_opacity_array");
  if (!Array.isArray(strokeOpacityValues)) {
    throw new Error(
      "changeOpacitySelectOptionsAsNewStep: missing stroke_opacity_array",
    );
  }
  const strokeOpacity = strokeOpacityValues;

  // group colors の数だけ繰り返す
  for (let i = 0; i < numberOfGroups; i++) {
    // 新しい opacitySteps の <option>に 置き換える
    // selected は 新しい<option>の中から 現在の値に一番近いものに 変更する
    replaceToNewStepOptions(i, opacitySteps, "opacity", opacity, svg2pngOption);
    replaceToNewStepOptions(
      i,
      opacitySteps,
      "stroke-opacity",
      strokeOpacity,
      svg2pngOption,
    );
  }
}

function replaceToNewStepOptions(
  i: number,
  opacitySteps: number,
  attrName: string,
  attrValueArray: string[],
  _svg2pngOption?: { height: number },
): void {
  // Get the elem to append the new <option>
  const opacitiesSelect = document.getElementById(
    `group-colors-${attrName}-${i}`,
  );
  if (opacitiesSelect === null) {
    throw new Error(
      `replaceToNewStepOptions: element not found: #group-colors-${attrName}-${i}`,
    );
  }

  // Delete current whole child <option> nodes
  while (opacitiesSelect.firstChild) {
    opacitiesSelect.removeChild(opacitiesSelect.firstChild);
  }

  // Add new <option>

  // 選択肢となる数値のリストを作成
  const values = numbersIncrementByStep(opacitySteps);

  // 現在の値を設定
  const currentValue = attrValueArray[i];

  // 現在の値に最も近い値を見つけ出す
  // Number() preserves the legacy coercion for the string option values.
  const closestValue = values.reduce((prev, curr) =>
    Math.abs(Number(curr) - Number(currentValue)) <
        Math.abs(Number(prev) - Number(currentValue))
      ? curr
      : prev
  );

  // 各選択肢を作成し、それぞれにvalue属性を設定
  values.forEach((value) => {
    const valuesOption = document.createElement("option");
    valuesOption.value = value;
    valuesOption.text = value;

    // 現在の値に最も近い値に対応するオプションに 'selected' 属性を設定
    if (value === closestValue) {
      valuesOption.setAttribute("selected", "selected");
    }

    opacitiesSelect.appendChild(valuesOption);
  });
}

// console.log(numbersIncrementByStep(0.04))
// console.log(numbersIncrementByStep(0.1))
// console.log(numbersIncrementByStep(0.2))
// Array(26) [ "1.0", "0.96", "0.92", "0.88", "0.84", "0.8", "0.76", "0.72", "0.68", "0.64", … "0.0" ]
// Array(11) [ "1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", … "0.0" ]
// Array (6) [ "1.0", "0.8", "0.6", "0.4", "0.2", "0.0" ]

// Update SVG

// Function to get the group colors value by ID
function getElementValueById(id: string): string {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`getElementValueById: element not found: #${id}`);
  }

  // Get 'opacity' or 'stroke-opacity' value from <select> element
  // .value が存在する場合はそれを返す
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }

  // For 'stroke' value from <div> element
  // .value が無ければ .textContent.trim() を返す
  const textContent = element.textContent;
  if (textContent === null) {
    throw new Error(`getElementValueById: element has no text content: #${id}`);
  }
  return textContent.trim();
}
