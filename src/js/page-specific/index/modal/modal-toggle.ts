export { initResetSettingsModalToggle, initSvgOptimizationModalToggle };

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
  const closeIcon = document.getElementById("svg-opt-close-icon");
  if (closeIcon === null) {
    throw new Error(
      "initSvgOptimizationModalToggle: missing element #svg-opt-close-icon",
    );
  }

  textarea.addEventListener("click", function () {
    modal.style.display = "block";
  });

  closeIcon.addEventListener("click", function () {
    modal.style.display = "none";
  });

  globalThis.addEventListener("click", function (event: MouseEvent) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

function initResetSettingsModalToggle(): void {
  const button = document.getElementById("reset-icon");
  if (button === null) {
    throw new Error(
      "initResetSettingsModalToggle: missing element #reset-icon",
    );
  }
  const modal = document.getElementById("reset-settings-modal");
  if (modal === null) {
    throw new Error(
      "initResetSettingsModalToggle: missing element #reset-settings-modal",
    );
  }
  const closeIcon = document.getElementById("reset-settings-close-icon");
  if (closeIcon === null) {
    throw new Error(
      "initResetSettingsModalToggle: missing element #reset-settings-close-icon",
    );
  }

  button.addEventListener("click", function () {
    modal.style.display = "block";
  });

  closeIcon.addEventListener("click", function () {
    modal.style.display = "none";
  });

  globalThis.addEventListener("click", function (event: MouseEvent) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}
