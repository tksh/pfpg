import { svg2pngOption } from "state/resvg-option";
import { renderCurrentSvg } from "state/render-state";
import { executeSvg2png } from "svg-to-png";

/**
 * Write the current render into the output textarea and rasterize it.
 *
 * Every handler ends the same way: the settings have already been persisted to
 * the URL, so the only thing left is to render and show. Keeping that sequence
 * in one place is what stops a handler from updating the URL but forgetting the
 * textarea, or the other way round.
 *
 * Returns the SVG that was rendered, for callers that need it.
 */
export function commitRender(): string {
  const svg = renderCurrentSvg();

  const svgTextarea = document.querySelector("#svg-string");
  if (svgTextarea === null) {
    throw new Error("commitRender: missing element #svg-string");
  }
  (svgTextarea as HTMLTextAreaElement).value = svg;

  executeSvg2png({ target: { value: svg } }, svg2pngOption);
  return svg;
}
