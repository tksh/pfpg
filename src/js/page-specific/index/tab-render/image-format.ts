import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export { initImageFormatSelect };

// Attach the event listener to the image format select

function initImageFormatSelect(): void {
  const imageFormatSelect = document.getElementById("image-format");
  if (!imageFormatSelect) {
    throw new Error("Element 'image-format' not found");
  }
  (imageFormatSelect as HTMLSelectElement).addEventListener(
    "change",
    (event: Event) => {
      const imageFormat = (event.target as HTMLSelectElement).value; // 'png' | 'webp'
      console.log("Updated value of 'Image format': ", imageFormat);
      updateState("imageFormat", imageFormat);

      // Re-render and re-upload in the newly selected format
      executeSvg2png({ target: { value: getSvgString() } }, svg2pngOption);
    },
  );
}
