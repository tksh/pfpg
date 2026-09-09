import { adjustLayoutIfNotMobile } from "init/adjust-layout";

export function initOptionDetailsToggleListener(): void {
  const details = document.getElementById("lines-option-details");
  if (details === null) {
    throw new Error(
      "initOptionDetailsToggleListener: element not found: #lines-option-details",
    );
  }
  details.addEventListener("toggle", () => {
    adjustLayoutIfNotMobile("detailsOpened");
  });
}
