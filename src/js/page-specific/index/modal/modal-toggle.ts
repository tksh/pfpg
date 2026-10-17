export { initImageOptimizationModalToggle, initSvgOptimizationModalToggle };

// The SVG optimization window opens on a click on the readonly output
// textarea, and the image optimization window on a click on the output image.
// Invoker command attributes (command/commandfor) only work on
// <button>/<input>, so these listeners are the one piece of popup JavaScript
// the <dialog> migration cannot remove. Close button, outside click
// (closedby="any") and Escape are all handled by the dialog itself.
function initSvgOptimizationModalToggle(): void {
  const textarea = document.getElementById("svg-string");
  if (textarea === null) {
    throw new Error(
      "initSvgOptimizationModalToggle: missing element #svg-string",
    );
  }
  const modal = document.getElementById("svg-opt-modal");
  if (modal === null) {
    throw new Error(
      "initSvgOptimizationModalToggle: missing element #svg-opt-modal",
    );
  }
  if (!(modal instanceof HTMLDialogElement)) {
    throw new Error(
      "initSvgOptimizationModalToggle: element #svg-opt-modal is not a <dialog>",
    );
  }

  textarea.addEventListener("click", function () {
    if (!modal.open) {
      modal.showModal();
    }
  });
}

function initImageOptimizationModalToggle(): void {
  const outputImage = document.querySelector("#output img");
  if (outputImage === null) {
    throw new Error(
      "initImageOptimizationModalToggle: missing element '#output img'",
    );
  }
  const modal = document.getElementById("img-opt-modal");
  if (modal === null) {
    throw new Error(
      "initImageOptimizationModalToggle: missing element #img-opt-modal",
    );
  }
  if (!(modal instanceof HTMLDialogElement)) {
    throw new Error(
      "initImageOptimizationModalToggle: element #img-opt-modal is not a <dialog>",
    );
  }

  outputImage.addEventListener("click", function () {
    if (!modal.open) {
      modal.showModal();
    }
  });
}
