import { commitRender } from "state/render-commit";
import { updateState } from "state/url-state-manager";

export { initShapeRenderingSelect };

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

      // Persisting the setting is enough: the SVG is regenerated from it.
      commitRender();
    },
  );
}
