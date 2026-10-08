import { extractViewboxValues } from "tab-canvas/crop-side-margins";
import { getGroupColorsAsJoinedHex } from "tab-lines/encode-colors-as-hex";
import { getImageFormat, IMAGE_FORMATS } from "state/image-format";

export { downloadPngAsFile, downloadSvgAsFile, getSvgString };

// Get Artwork data

// Get the svg string from <textarea> element
function getSvgString(): string {
  const svgStringElem = document.querySelector("#svg-string");
  if (svgStringElem === null) {
    throw new Error("getSvgString: missing element #svg-string");
  }
  return (svgStringElem as HTMLTextAreaElement).value.trim(); // '.trim()' => 文字列の両端の空白を削除
}

// Get the artwork ID
function getArtworkTitle(): string {
  const inputSvg = getSvgString();
  // Set the regex to match the title inside the <title> tag
  // `.` は任意の一文字にマッチし `*?` は直前の文字が 0回以上できるだけ少なく 繰り返される
  const patternForTitle = /<title>(.*?)<\/title>/g;

  // Assign the content of the <title> tag to a variable
  const titleMatch = patternForTitle.exec(inputSvg);
  if (titleMatch === null) {
    throw new Error("getArtworkTitle: no <title> found in SVG");
  }
  const titleText = titleMatch[1];
  if (titleText === undefined) {
    throw new Error("getArtworkTitle: no <title> found in SVG");
  }

  return titleText;
}

// Get the rasterized pixel size of PNG
function getPixelSizeWxH(): string {
  // from info text
  const pngInfoElem = document.getElementById("png-info");
  if (pngInfoElem === null) {
    throw new Error("getPixelSizeWxH: missing element #png-info");
  }
  const pngInfoText = pngInfoElem.textContent;
  if (pngInfoText === null) {
    throw new Error("getPixelSizeWxH: missing text in #png-info");
  }

  // extract WxH from like 'Converted PNG size: 352 x 352 px'
  const patternForPngSize = /(\d+) x (\d+)/;

  // Assign the content of the <title> tag to a variable
  const matchesPngSize = patternForPngSize.exec(pngInfoText); // 配列の 0番目には全体のマッチ結果, 1番目以降にはグルーピングした部分
  if (matchesPngSize === null) {
    throw new Error("getPixelSizeWxH: no WxH found in #png-info");
  }

  const pngSizeWidth = matchesPngSize[1];
  const pngSizeHeight = matchesPngSize[2];
  if (pngSizeWidth === undefined || pngSizeHeight === undefined) {
    throw new Error("getPixelSizeWxH: no WxH found in #png-info");
  }
  const pngSizeWxH = `${pngSizeWidth}x${pngSizeHeight}`;

  return pngSizeWxH;
}

// Get the current preference status
function getCurrentStatusForFilename(): string {
  // Group colors
  const groupColorsHexString = getGroupColorsAsJoinedHex(getSvgString());

  // Path mode
  const pathModeSelect = document.getElementById("path-mode") as
    | HTMLSelectElement
    | null;
  if (pathModeSelect === null) {
    throw new Error("getCurrentStatusForFilename: missing element #path-mode");
  }
  const pathMode = pathModeSelect.value;

  // Anti-aliasing (shapeRendering)
  const antiAliasingSelect = document.getElementById("shape-rendering") as
    | HTMLSelectElement
    | null;
  if (antiAliasingSelect === null) {
    throw new Error(
      "getCurrentStatusForFilename: missing element #shape-rendering",
    );
  }
  const shapeRendering = antiAliasingSelect.value;

  // Shape to trim
  const shapeToTrimSelect = document.getElementById("shape-to-trim") as
    | HTMLSelectElement
    | null;
  if (shapeToTrimSelect === null) {
    throw new Error(
      "getCurrentStatusForFilename: missing element #shape-to-trim",
    );
  }
  let shapeToTrim = shapeToTrimSelect.value; // 要素の値は文字列として扱われる

  // 'Shape to trim' に 'squircleSlimmed' が 適用されている場合だけ ふたつのオプションの値を取得し それを含むファイル名を生成する
  if (shapeToTrim === "squircleSlimmed") {
    // Two options for 'Squircle, slimmed'
    const selectWidthNarrowness = document.getElementById("width-narrowness") as
      | HTMLSelectElement
      | null;
    if (selectWidthNarrowness === null) {
      throw new Error(
        "getCurrentStatusForFilename: missing element #width-narrowness",
      );
    }
    const selectTopHeavyRatio = document.getElementById("top-heavy-ratio") as
      | HTMLSelectElement
      | null;
    if (selectTopHeavyRatio === null) {
      throw new Error(
        "getCurrentStatusForFilename: missing element #top-heavy-ratio",
      );
    }
    const widthNarrowness = selectWidthNarrowness.value;
    const topHeavyRatio = selectTopHeavyRatio.value;

    // Merge with two option values
    shapeToTrim = `squircleSlimmed_${widthNarrowness}_${topHeavyRatio}`;
  }

  // Merge the all values of status
  return `g_${groupColorsHexString}-p_${pathMode}-t_${shapeToTrim}-r_${shapeRendering}`;
}

// Download the rendered image (PNG or WebP) as file

function downloadPngAsFile(): void {
  // Get a Blob URL from rasterized img
  const imgElem = document.getElementById("img") as HTMLImageElement | null;
  if (imgElem === null) {
    throw new Error("downloadPngAsFile: missing element #img");
  }
  const url = imgElem.src;

  // Generate an <a> element
  const link = document.createElement("a");
  // set the url as 'href' attr
  link.href = url;

  // Generate a the filename

  // title
  const artworkTitle = getArtworkTitle();

  // rasterized PNG pixel size
  const pixelSize = getPixelSizeWxH();

  // current status
  const currentStatus = getCurrentStatusForFilename();

  // The extension follows the selected output format
  const { extension } = IMAGE_FORMATS[getImageFormat()];

  // Set the filename
  link.download =
    `${artworkTitle}-${pixelSize}px-${currentStatus}.${extension}`;

  link.click();
}
// e.g.: 202308_001-256x256px-g_000_000_000_EEE_FFF-p_abs-b_9999-t_square-r_crispEdges.png

// Download SVG as file

function downloadSvgAsFile(): void {
  const inputSvg = getSvgString();
  const blob = new Blob([inputSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Generate a the filename

  // title
  const artworkTitle = getArtworkTitle();

  // viewbox
  const viewboxValues = extractViewboxValues(inputSvg);
  if (viewboxValues === null) {
    throw new Error("downloadSvgAsFile: invalid viewBox");
  }
  const viewboxValueDelimitedWithUnderscores = viewboxValues.get("x") + "_" +
    viewboxValues.get("y") + "_" +
    viewboxValues.get("w") + "_" +
    viewboxValues.get("h"); // e.g.: 0_0_31_31

  // current status
  const currentStatus = getCurrentStatusForFilename();

  // Set the filename
  link.download =
    `${artworkTitle}-v_${viewboxValueDelimitedWithUnderscores}-${currentStatus}.svg`;

  link.click();
}
// e.g.: 202404_001-v_0_0_31_31-g_000-p_absSep-b_FFF-t_square-r_crispEdges.svg
