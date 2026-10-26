import { getSvgString } from "button/download-as-file";
import { syncCopyAvailability } from "button/update-button-text";
import { getImageFormat, type ImageFormat } from "state/image-format";
import { svg2pngOption } from "state/resvg-option";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export { initImageFormatSelect };

// The two UI-tab legends that name the current raster format carry only
// image-format names, which every locale writes the same way, so they were
// dropped from the translation system and are rewritten here instead.
function updateFormatLegends(format: ImageFormat): void {
  const pngSvgLegend = document.getElementById("legend-png-svg");
  if (pngSvgLegend === null) {
    throw new Error("updateFormatLegends: missing element #legend-png-svg");
  }
  const pngLegend = document.getElementById("legend-png");
  if (pngLegend === null) {
    throw new Error("updateFormatLegends: missing element #legend-png");
  }
  pngSvgLegend.textContent = format === "webp" ? "WebP/SVG:" : "PNG/SVG:";
  pngLegend.textContent = format === "webp" ? "WebP:" : "PNG:";
}

// Attach the event listener to the image format select

function initImageFormatSelect(): void {
  const imageFormatSelect = document.getElementById("image-format");
  if (!imageFormatSelect) {
    throw new Error("Element 'image-format' not found");
  }

  // A URL restored with `imageFormat=webp` must show the WebP labels before
  // any change event fires.
  updateFormatLegends(getImageFormat());

  (imageFormatSelect as HTMLSelectElement).addEventListener(
    "change",
    (event: Event) => {
      const imageFormat = (event.target as HTMLSelectElement).value; // 'png' | 'webp'
      updateState("imageFormat", imageFormat);
      updateFormatLegends(getImageFormat());
      syncCopyAvailability();

      // Re-render and re-upload in the newly selected format
      executeSvg2png({ target: { value: getSvgString() } }, svg2pngOption);
    },
  );
}
