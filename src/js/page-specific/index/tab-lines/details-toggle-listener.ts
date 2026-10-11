import { adjustLayoutIfNotMobile } from "init/adjust-layout";

// Both collapsibles in the Lines tab are siblings at the same level, so both
// need the same layout re-adjust on open.
const LINES_DETAILS_IDS = ["lines-option-details", "color-randomization"];

export function initOptionDetailsToggleListener(): void {
  for (const detailsId of LINES_DETAILS_IDS) {
    const details = document.getElementById(detailsId);
    if (details === null) {
      throw new Error(
        `initOptionDetailsToggleListener: element not found: #${detailsId}`,
      );
    }
    details.addEventListener("toggle", () => {
      adjustLayoutIfNotMobile("detailsOpened");
    });
  }
}
