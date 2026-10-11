import { adjustLayoutIfNotMobile } from "init/adjust-layout";

// Both collapsibles in the Lines tab are siblings at the same level, so both
// need the same layout re-adjust on open. Each id mirrors its <summary> text:
// 'Artwork format:' and 'Color randomization:'.
const LINES_DETAILS_IDS = ["artwork-format", "color-randomization"];

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
