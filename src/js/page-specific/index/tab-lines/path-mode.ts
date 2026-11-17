import { commitRender } from "state/render-commit";
import { updateState } from "state/url-state-manager";

export { initPathModeSelect };

/**
 * Path mode only changes how the codec writes path data: it does not change the
 * drawing. The artwork is decoded once, and `generateSvg()` re-renders it in
 * the newly selected mode, so there is nothing to save and restore.
 */
function initPathModeSelect(): void {
  const pathModeSelect = document.getElementById("path-mode");
  if (pathModeSelect === null) {
    throw new Error("initPathModeSelect: element not found: #path-mode");
  }
  pathModeSelect.addEventListener("change", (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      throw new Error(
        "initPathModeSelect: expected select element for #path-mode",
      );
    }

    updateState("pathMode", target.value);
    commitRender();
  });
}
