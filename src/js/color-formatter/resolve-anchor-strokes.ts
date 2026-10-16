export { resolveAnchorStrokes };

// Which of the app's two sets of line colors the L/C/H ranges are applied
// around. See the plan in the lsvg-memo repo:
// pfpg/plans-archived/base-colors-dropdown.md
export type BaseMode = "original" | "current";

// Pick the anchor colors for one randomization.
//
// There are exactly two sets of line colors in this app, not three: the
// artwork's own, and the `groupColors` value that overwrites them. The live
// `#svg-string` is never a third state waiting between them — the textarea is
// `readonly`, the only two operations that change a stroke both write
// `groupColors` back, and every other writer recovers and re-emits strokes
// unchanged. So `current` is that value, read at click time, and needs no
// stored state; only `original` has to have been captured in advance.
//
// `artworkLineStrokes` is deliberately not nullable. It is captured
// unconditionally at decode time, so the "anchor missing" case is designed out
// rather than handled by a fallback — a silent fallback is what let the palette
// random-walk before this existed.
function resolveAnchorStrokes(
  base: BaseMode,
  artworkLineStrokes: string[],
  currentLineStrokes: string[],
): string[] {
  const anchors = base === "current" ? currentLineStrokes : artworkLineStrokes;

  // A mismatch means the snapshot and the SVG disagree about how many groups
  // exist. Randomizing what can be matched would leave the artwork half
  // rewritten, so this is an error rather than a partial result.
  if (anchors.length !== currentLineStrokes.length) {
    throw new Error(
      `resolveAnchorStrokes: ${base} anchor has ${anchors.length} colors for ${currentLineStrokes.length} groups`,
    );
  }

  // Copied so that a caller mutating the result cannot corrupt the snapshot and
  // make a later click anchor on an already-randomized palette.
  return [...anchors];
}
