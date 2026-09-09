import { updateState } from "state/url-state-manager";

export { initTextWrappingCheckbox, toggleTextWrapping };

function initTextWrappingCheckbox(): void {
  const checkbox = document.getElementById("text-wrapping");
  if (!checkbox) throw new Error("Element 'text-wrapping' not found");
  const checkboxInput = checkbox as HTMLInputElement;

  checkbox.addEventListener("change", () => {
    const isTextWrapping = checkboxInput.checked;
    console.log("isTextWrapping: ", isTextWrapping);
    updateState("textWrapping", isTextWrapping);
    toggleTextWrapping(isTextWrapping);
  });
}

function toggleTextWrapping(isTextWrapping: boolean): void {
  //  checkbox.checked => remove 'no-wrap' class => set url param as 'textWrapping(isTextWrapping)=true'
  // !checkbox.checked =>    add 'no-wrap' class => set url param as 'textWrapping(isTextWrapping)=false'
  const svgTextarea = document.querySelector("#svg-string");
  if (!svgTextarea) throw new Error("Element '#svg-string' not found");

  if (isTextWrapping === true) {
    svgTextarea.classList.remove("no-wrap");
  } else { // (isTextWrapping === false)
    svgTextarea.classList.add("no-wrap");
  }
}
