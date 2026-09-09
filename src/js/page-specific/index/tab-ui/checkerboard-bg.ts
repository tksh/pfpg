import { updateState } from "state/url-state-manager";

export { initCheckerboardBgCheckbox, toggleCheckerboardBg };

function initCheckerboardBgCheckbox(): void {
  const checkbox = document.getElementById("checkerboard-bg");
  if (!checkbox) throw new Error("Element 'checkerboard-bg' not found");
  const checkboxInput = checkbox as HTMLInputElement;

  checkboxInput.addEventListener("change", () => {
    const isCheckerboardBg = checkboxInput.checked;
    console.log("isCheckerboardBg: ", isCheckerboardBg);
    updateState("checkerboardBg", isCheckerboardBg);
    toggleCheckerboardBg(isCheckerboardBg);
  });
}

function toggleCheckerboardBg(isCheckerboardBg: boolean): void {
  const img = document.querySelector("img");
  if (!img) throw new Error("Element 'img' not found");
  img.classList.toggle("checker", isCheckerboardBg);
}
