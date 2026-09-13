import { getSvgString } from "button/download-as-file";

export { copyPngToClipboard, copySvgToClipboard };

// Copy PNG blob to clipboard

function copyPngToClipboard(): void {
  try {
    const imgElem = document.getElementById("img") as HTMLImageElement | null;
    if (imgElem === null) {
      throw new Error("copyPngToClipboard: missing element #img");
    }
    //console.log("imgElem:", imgElem)
    // e.g.: <img id="img" class="checker fit-to-display-area" alt="Output PNG" src="blob:http://172.19.175.1…6-4350-9c80-553a0e4fceaf">

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("copyPngToClipboard: 2d context unavailable");
    }

    canvas.width = imgElem.naturalWidth;
    canvas.height = imgElem.naturalHeight;
    ctx.drawImage(imgElem, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob === null) {
        throw new Error("copyPngToClipboard: toBlob returned null");
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      console.log("PNG image copied to clipboard");

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
    });
  } catch (error) {
    console.error("Failed to copy PNG image: ", error);
  }
}

// Copy SVG text to clipboard

async function copySvgToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(getSvgString());
    console.log("SVG Text copied to clipboard");

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
