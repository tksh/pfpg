export { initSvgOptimizationModalToggle };

// The SVG optimization window opens on a click on the readonly output textarea.
// Invoker command attributes (command/commandfor) only work on <button>/<input>,
// so this listener is the one piece of popup JavaScript the <dialog> migration
// cannot remove. Close button, outside click (closedby="any") and Escape are
// all handled by the dialog itself.
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
