import { getSvgString } from "button/download-as-file";
import { getLastRenderedImage } from "svg-to-png";

export { copyPngToClipboard, copySvgToClipboard };

// Copy the rendered image to clipboard

async function copyPngToClipboard(): Promise<void> {
  try {
    // The already encoded bytes are copied as-is, so the clipboard holds the
    // selected format rather than a re-encoded image
    const image = getLastRenderedImage();
    if (image === null) {
      throw new Error("copyPngToClipboard: no rendered image to copy");
    }

    const clipboardItem = new ClipboardItem({
      [image.mimeType]: new Blob([image.bytes.slice()], {
        type: image.mimeType,
      }),
    });
    await navigator.clipboard.write([clipboardItem]);

    const pngActionButtonElement = document.getElementById(
      "png-action-button",
    );
    if (pngActionButtonElement === null) {
      throw new Error(
        "copyPngToClipboard: missing element #png-action-button",
      );
    }
    const originalText = pngActionButtonElement.innerHTML;

    pngActionButtonElement.textContent = "✔️ Successfully copied!";

    setTimeout(() => {
      pngActionButtonElement.innerHTML = originalText;
    }, 1500);
  } catch (error) {
    console.error("Failed to copy the rendered image: ", error);
  }
}

// Copy SVG text to clipboard

async function copySvgToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(getSvgString());

    const svgActionButtonElement = document.getElementById("svg-action-button");
    if (svgActionButtonElement === null) {
      throw new Error("copySvgToClipboard: missing element #svg-action-button");
    }
    const originalHtml = svgActionButtonElement.innerHTML;

    // 成功メッセージを表示し、success-message クラスを追加
    svgActionButtonElement.textContent = "✔️ Successfully copied!";

    setTimeout(() => {
      svgActionButtonElement.innerHTML = originalHtml;
    }, 1500);
  } catch (error) {
    console.error("Failed to copy SVG text: ", error);
  }
}
