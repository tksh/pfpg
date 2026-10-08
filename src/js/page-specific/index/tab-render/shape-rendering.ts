import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export { initShapeRenderingSelect, replaceShapeRendering };

function initShapeRenderingSelect(): void {
  // Event listeners for 'shape-rendering' type changes
  const shapeRenderingSelect = document.getElementById("shape-rendering");
  if (!shapeRenderingSelect) {
    throw new Error("Element 'shape-rendering' not found");
  }
  (shapeRenderingSelect as HTMLSelectElement).addEventListener(
    "change",
    (event: Event) => {
      // 選択された値を 取得
      const shapeRendering = (event.target as HTMLSelectElement).value; // 'geometricPrecision' | 'crispEdges'
      updateState("shapeRendering", shapeRendering);

      // <textarea>の value属性を 取得
      const svgString = getSvgString();

      // 選択された値に SVG文字列を 置き換える
      const updatedSvg = replaceShapeRendering(svgString, shapeRendering);

      // <textarea>の value属性を 更新する
      const svgTextarea = document.querySelector("#svg-string");
      if (!svgTextarea) throw new Error("Element '#svg-string' not found");
      (svgTextarea as HTMLTextAreaElement).value = updatedSvg;

      // Rendering the PNG with updated SVG
      executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
    },
  );
}

function replaceShapeRendering(
  svgString: string,
  shapeRendering: string,
): string {
  // 正規表現パターンを作成
  const patternForShapeRendering = /shape-rendering="[^"]*"/g;
  // 正規表現でマッチした部分を書き換える
  return svgString.replace(
    patternForShapeRendering,
    `shape-rendering="${shapeRendering}"`,
  );
}
