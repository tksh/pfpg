import { svg2pngOption } from "state/resvg-option";
import { renderCurrentSvg } from "state/render-state";
import { executeSvg2png } from "svg-to-png";

export interface CommitOptions {
  /**
   * Re-serialize the groups into the current `colorFormat` before showing.
   *
   * The colour format is a serialization setting, so changing it has to reach
   * the SVG text as well as the pickers. It does not change the pixels.
   */
  forceColorFormat?: boolean;
  /**
   * Skip rasterization. Use when the change cannot alter the pixels, such as a
   * pure notation change, so a drag does not re-encode the image.
   */
  skipRaster?: boolean;
}

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
export function commitRender(options: CommitOptions = {}): string {
  const svg = renderCurrentSvg(options);

  const svgTextarea = document.querySelector("#svg-string");
  if (svgTextarea === null) {
    throw new Error("commitRender: missing element #svg-string");
  }
  (svgTextarea as HTMLTextAreaElement).value = svg;

  if (!options.skipRaster) {
    executeSvg2png({ target: { value: svg } }, svg2pngOption);
  }
  return svg;
}
