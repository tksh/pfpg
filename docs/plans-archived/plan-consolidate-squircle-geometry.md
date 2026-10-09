# Consolidate Squircle Geometry

## Goal

Implement investigation memo案A: calculate the `squircleSlimmed` geometry once
and use the same values for both the clip path and the cropped `viewBox`.

## Scope

- Update `src/js/page-specific/index/tab-canvas/shape-to-trim.ts`.
- Update `src/js/page-specific/index/tab-canvas/crop-side-margins.ts` only as
  needed to remove the generated-path regex dependency.
- Preserve the current rounded coordinate values, SVG text formatting options,
  and public exports.
- Do not change renderer behavior or introduce dependencies.

## Implementation

1. Add a small internal geometry result containing the rounded center, left,
   right, top control point, grid size, and generated path data.
2. Make `squircleSlimmed` generation return that result rather than only a path
   string.
3. Build the clip path from the result's path data.
4. When crop-side-margins is enabled, update `viewBox` directly from the same
   rounded left/right values.
5. Keep non-slimmed shapes on the existing original-viewBox restoration path.
6. Remove only the obsolete path parsing helper and related import/export.

## Validation

- Run the focused project check/lint commands available in `deno.jsonc`.
- Run the project tests if available.
- Verify the diff preserves existing public behavior and does not modify
  unrelated user changes.

No commit will be created.
