import { TAB_SPACE } from "constants";
import { getSvgString } from "button/download-as-file";
import { updateButtonWithSvgSize } from "button/update-button-text";
import {
  removeOpacity,
  restoreOpacity,
} from "group-colors-svg/group-colors-svg";
import { getState, updateState } from "state/url-state-manager";
import { decodeAsSelectedPathMode } from "tab-lines/path-mode";

export {
  getCurrentPathModeIndentation,
  getSvgIndentation,
  initSvgOptimization,
  optimizeSvg,
  removeLineBreaks,
  removeOpacity,
  removeSpaces,
  tryRemoveLineBreaks,
  tryRemoveOpacity,
  tryRemoveSpaces,
};

// Functions for 'applySvgOptimization()'
// Restore the status of optimization via ulr params

function tryRemoveOpacity(
  svgString: string,
  isOpacityRemoved: unknown,
): string {
  console.log("tryRemoveOpacity executed.");
  if (isOpacityRemoved) {
    return removeOpacity(svgString);
  } else {
    return svgString;
  }
}
function tryRemoveLineBreaks(
  svgString: string,
  isLineBreaksRemoved: unknown,
): string {
  console.log("tryRemoveLineBreaks executed.");
  if (isLineBreaksRemoved) {
    return removeLineBreaks(svgString);
  } else {
    return svgString;
  }
}
function tryRemoveSpaces(svgString: string, isSpacesRemoved: unknown): string {
  console.log("tryRemoveSpaces executed.");
  if (isSpacesRemoved) {
    return removeSpaces(svgString);
  } else {
    return svgString;
  }
}

// Add event listeners to the three checkboxes in the modal

// One entry per SVG optimization checkbox: the remove/restore pair plus
// the state key. `needsPathMode` marks the entry whose restore step
// re-indents via the currently selected path mode.
interface SvgOptimizationOption {
  id: string;
  stateKey: string;
  removeFunction: (svgString: string) => string;
  restoreFunction: (
    svgString: string,
    pathMode?: string,
  ) => string | Promise<string>;
  needsPathMode?: boolean;
}

// Define an array of SVG optimization options
const svgOptions: SvgOptimizationOption[] = [
  {
    id: "remove-opacity",
    stateKey: "removeOpacity",
    removeFunction: removeOpacity,
    restoreFunction: restoreOpacity,
  },
  {
    id: "remove-line-breaks",
    stateKey: "removeLineBreaks",
    removeFunction: removeLineBreaks,
    restoreFunction: restoreLineBreaks,
    needsPathMode: true,
  }, // This boolean is required only for restoration.
  {
    id: "remove-spaces",
    stateKey: "removeSpaces",
    removeFunction: removeSpaces,
    restoreFunction: restoreSpaces,
  },
];

// Initialize event listeners for SVG optimization checkboxes
function initSvgOptimization(): void {
  const checkboxes = document.querySelectorAll(
    '#svg-opt-modal input[type="checkbox"]',
  );
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", async (event) => {
      await updateSvg(event);
    })
  );
}

// Apply SVG optimizations based on checked/un-checked options
// Update the textarea content, URL parameters, and button text accordingly
async function updateSvg(event: Event): Promise<void> {
  let svgString = getSvgString();

  const target = event.target as HTMLInputElement | null;
  if (target === null) {
    throw new Error("updateSvg: missing event target");
  }
  const isChecked = target.checked;
  const optionId = target.id; // e.g.: 'remove-opacity'

  for (const option of svgOptions) {
    if (optionId === option.id) { // Identify the currently selected option
      if (isChecked) {
        svgString = option.removeFunction(svgString);
        updateState(option.stateKey, true);

        // Toggle classes for the <code> content text
        const beforeCheckedElem = document.querySelector(`#before-${optionId}`);
        if (beforeCheckedElem === null) {
          throw new Error(`updateSvg: missing element #before-${optionId}`);
        }
        beforeCheckedElem.classList.toggle("option-applied", !isChecked);
        const afterCheckedElem = document.querySelector(`#after-${optionId}`);
        if (afterCheckedElem === null) {
          throw new Error(`updateSvg: missing element #after-${optionId}`);
        }
        afterCheckedElem.classList.toggle("option-applied", isChecked);
      } else {
        if (option.needsPathMode) {
          const pathMode = getState("pathMode") as string;
          svgString = await option.restoreFunction(svgString, pathMode); // option.restoreFunction
        } else {
          svgString = await option.restoreFunction(svgString);
        }
        updateState(option.stateKey, false);

        // Toggle classes for the <code> content text
        const beforeUncheckedElem = document.querySelector(
          `#before-${optionId}`,
        );
        if (beforeUncheckedElem === null) {
          throw new Error(`updateSvg: missing element #before-${optionId}`);
        }
        beforeUncheckedElem.classList.toggle("option-applied", !isChecked);
        const afterUncheckedElem = document.querySelector(`#after-${optionId}`);
        if (afterUncheckedElem === null) {
          throw new Error(`updateSvg: missing element #after-${optionId}`);
        }
        afterUncheckedElem.classList.toggle("option-applied", isChecked);
      }
    }

    // Update the textarea with optimized SVG
    const svgStringElem = document.querySelector("#svg-string");
    if (svgStringElem === null) {
      throw new Error("updateSvg: missing element #svg-string");
    }
    (svgStringElem as HTMLTextAreaElement).value = svgString;
    // Display the size of the updated SVG string on the action button
    updateButtonWithSvgSize(svgString);
  }
}

function removeLineBreaks(svgString: string): string {
  return svgString.replace(/>\s+</g, "><");
}

async function restoreLineBreaks(
  svgString: string,
  pathMode?: string,
): Promise<string> {
  if (pathMode === undefined) {
    throw new Error("restoreLineBreaks: missing pathMode");
  }
  const indentCounts = await getCurrentPathModeIndentation(pathMode);
  const formattedSvg = svgString.replace(/></g, ">\n<");
  const lines = formattedSvg.split("\n");

  const indentedLines = lines.map((line, index) => {
    const indentCount = indentCounts[index] ?? 0;
    return TAB_SPACE.repeat(indentCount) + line.trim();
  });

  return indentedLines.join("\n");
}

// Get the indentation as numbers in array
function getSvgIndentation(svgString: string): number[] {
  const lines = svgString.split("\n");
  return lines.map((line) => {
    const match = line.match(/^(\s*)/);
    if (match === null) {
      return 0;
    }
    return Math.floor((match[1] ?? "").length / 4);
  });
}

async function getCurrentPathModeIndentation(
  pathMode: string,
): Promise<number[]> {
  const svgString = await decodeAsSelectedPathMode(pathMode);
  return getSvgIndentation(svgString ?? "");
}

function removeSpaces(svgString: string): string {
  return svgString.replace(
    /(\sd="[^>]+>)/g,
    (_match: string, pathData: string) => { // Use \sd= to skip id=
      const optimizedPath = pathData
        // コマンド後のスペース削除
        .replace(/([MLHVCSQTAZ])\s+/gi, "$1")
        // e.g.: <path d="M 12 34 L 56 78" /> => <path d="M12 34 L56 78" />

        // 数字 と コマンド のあいだのスペース削除
        .replace(/(\d)\s+([MLHVCSQTAZ])/gi, "$1$2")
        // e.g.: <path d="M12 34 L56 78" /> => <path d="M12 34L56 78" />

        // 数字 と 負の値の数字 のあいだのスペース削除 (for relative coordinates values)
        .replace(/ -/g, "-")
        // e.g.: <path d="d="m12 3 45 6m-7 89 -10 11"/> => <path d="d="m12 3 45 6m-7 89-10 11"/>

        // ダブルクォート と スラッシュ のあいだのスペース削除
        .replace(/"\s+(\/)/g, '"$1');
      // e.g.: <path d="M12 34L56 78" /> => <path d="M12 34L56 78"/>

      return optimizedPath;
    },
  );
}
// // Test
// console.log(removeSpaces('<path d="M 12 34 L 56 78" />'))  // Absolute
// // <path d="M36 61L33 68"/>
// console.log(removeSpaces('<path d="d="m 12 3 45 6 m -7 89 -10 11" />'))  // Relative
// // <path d="d="m12 3 45 6m-7 89-10 11"/>
// console.log(removeSpaces('<path d="M 6.35 63.5 Q 5.08 0 63.5 0 T 120.65 63.5 63.5 127 6.35 63.5" />'))  // Squircle, slimmed
// // <path d="M6.35 63.5Q5.08 0 63.5 0T120.65 63.5 63.5 127 6.35 63.5"/>

function restoreSpaces(svgString: string): string {
  return svgString.replace(
    /(\sd="[^>]+>)/g,
    (_match: string, pathData: string) => { // Use \sd= to skip id=
      const restoredPath = pathData
        // コマンド後にスペース挿入
        .replace(/([MLHVCSQTAZ])/gi, "$1 ")
        // 数字 と コマンド のあいだにスペース挿入
        .replace(/(\d)([MLHVCSQTAZ])/gi, "$1 $2")
        // 数字 と 負の値の数字 のあいだにスペース挿入 (for relative coordinates values)
        .replace(/(\d)-/g, "$1 -")
        // ダブルクォート と スラッシュ のあいだにスペース挿入
        .replace(/"(\/)/g, '" $1');

      return restoredPath;
    },
  );
}
// // Test
// console.log(restoreSpaces('<path d="M36 61L33 68"/>'))  // Absolute
// // <path d="M 36 61 L 33 68" />
// console.log(restoreSpaces('<path d="d="m12 3 45 6m-7 89-10 11"/>'))  // Relative
// // <path d="d="m 12 3 45 6 m -7 89 -10 11" />
// console.log(restoreSpaces('<path d="M6.35 63.5Q5.08 0 63.5 0T120.65 63.5 63.5 127 6.35 63.5"/>'))  // Squircle, slimmed
// // <path d="M 6.35 63.5 Q 5.08 0 63.5 0 T 120.65 63.5 63.5 127 6.35 63.5" />

// Bulk apply the optimizations based on current url params status, after 'pathMode' changes.
// It will restore the string to how it looked before the changes.
function optimizeSvg(svgString: string, state: Map<string, unknown>): string {
  let optimizedSvg = svgString;
  for (const [functionName, isEnabled] of state) {
    const optimizeFunction = optimizeFunctions[functionName];
    if (isEnabled && typeof optimizeFunction === "function") {
      optimizedSvg = optimizeFunction(optimizedSvg);
    }
  }
  return optimizedSvg;
}

const optimizeFunctions: Record<string, (svgString: string) => string> = {
  removeOpacity,
  removeLineBreaks,
  removeSpaces,
};
