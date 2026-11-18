import { removeLineBreaks, removeSpaces } from "libpfpg/optimize";
import { updateButtonWithSvgSize } from "button/update-button-text";
import { commitRender } from "state/render-commit";
import { getState, updateState } from "state/url-state-manager";

export { initSvgOptimization };

/**
 * One entry per SVG optimization checkbox.
 *
 * The checkbox is the only state: the SVG is regenerated from it on every
 * change. The old remove/restore pair existed because the string had to be
 * edited in place; regenerating makes both directions the same operation.
 */
interface SvgOptimizationOption {
  id: string;
  stateKey: string;
}

const svgOptions: SvgOptimizationOption[] = [
  { id: "remove-opacity", stateKey: "removeOpacity" },
  { id: "remove-line-breaks", stateKey: "removeLineBreaks" },
  { id: "remove-spaces", stateKey: "removeSpaces" },
];

// Initialize event listeners for SVG optimization checkboxes
function initSvgOptimization(): void {
  const checkboxes = document.querySelectorAll(
    '#svg-opt-modal input[type="checkbox"]',
  );
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", (event) => updateSvg(event))
  );
}

// Apply the optimizations selected in the modal.
// The URL is updated first, so the render that follows picks the new flags up.
function updateSvg(event: Event): void {
  const target = event.target as HTMLInputElement | null;
  if (target === null) {
    throw new Error("updateSvg: missing event target");
  }

  const optionId = target.id; // e.g.: 'remove-opacity'
  const isChecked = target.checked;

  const option = svgOptions.find((candidate) => candidate.id === optionId);
  if (option === undefined) {
    throw new Error(`updateSvg: unknown option #${optionId}`);
  }

  updateState(option.stateKey, isChecked);
  applyOptionAppearance(optionId, isChecked);

  const svgString = commitRender();
  updateButtonWithSvgSize(svgString);
}

/**
 * Show one option as applied or not, on both the checkbox and the samples.
 *
 * Shared by the change handler and the startup sync, so a URL that already
 * carries `?removeOpacity=true` cannot show an unchecked box next to a sample
 * that claims the option is off.
 */
function applyOptionAppearance(optionId: string, isChecked: boolean): void {
  const beforeCheckedElem = document.querySelector(`#before-${optionId}`);
  if (beforeCheckedElem === null) {
    throw new Error(
      `applyOptionAppearance: missing element #before-${optionId}`,
    );
  }
  beforeCheckedElem.classList.toggle("option-applied", !isChecked);

  const afterCheckedElem = document.querySelector(`#after-${optionId}`);
  if (afterCheckedElem === null) {
    throw new Error(
      `applyOptionAppearance: missing element #after-${optionId}`,
    );
  }
  afterCheckedElem.classList.toggle("option-applied", isChecked);
}

/**
 * Bring the modal's checkboxes and samples in line with the URL.
 *
 * The SVG itself is rendered from the settings, so only the visible state of
 * the controls can disagree with it. Without this, opening a URL that carries
 * `?removeOpacity=true` shows an unchecked box, because the markup ships with
 * every option off.
 */
function syncSvgOptimizationUi(): void {
  for (const option of svgOptions) {
    const input = document.getElementById(option.id);
    if (input === null) {
      throw new Error(`syncSvgOptimizationUi: missing checkbox #${option.id}`);
    }
    // Checked is the only property used, so a plain object stands in for the
    // element in tests without a DOM implementation.
    const isChecked = getState(option.stateKey) === true;
    (input as HTMLInputElement).checked = isChecked;
    applyOptionAppearance(option.id, isChecked);
  }
}

// The remove functions are re-exported for callers that render arbitrary SVG
// text (the data-manipulator page), and the startup sync for the page shell.
export { removeLineBreaks, removeSpaces, syncSvgOptimizationUi };
