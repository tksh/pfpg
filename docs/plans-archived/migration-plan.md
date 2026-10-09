# Migration Plan: `@resvg/resvg-js` → `svg2png-wasm`

This plan documents the step-by-step migration from `@resvg/resvg-wasm` to
`svg2png-wasm` for the pfpg project.

---

## 1. Inventory

### 1.1 Import and usage locations

**Files using `@resvg/resvg-js` / `@resvg/resvg-wasm`:**

- `src/js/page-specific/index/svg-to-png.js`
  - Line 118: `const resvgJS = new resvg.Resvg(svgString, resvgOption)`
  - Line 123: `const pngData = resvgJS.render()`
  - Line 126: `const pngBuffer = pngData.asPng()`
  - Line 149: `updateDimensionInfo('png', pngData.width, pngData.height)`
  - Lines 89-93: Cleanup calls `.free()` on `resvgJS` and `pngData`

- `src/js/page-specific/index/main.js`
  - Line 85:
    `await resvg.initWasm(fetch('../../../resvg-js-wasm/index_bg.wasm'))`
  - Line 87: `executeSvg2png({ target: { value: svgString } }, resvgOption)`

- `src/js/page-specific/index/state/resvg-option.js`
  - Lines 2-7: Defines `resvgOption` with
    `fitTo: { mode: 'height', value: 256 }`

- `src/js/page-specific/index/dynamic-ogp/generate-and-upload.js`
  - Line 42: `new Blob([pngData.asPng()], { type: 'image/png' })`
  - Line 108: `calculateImageDimensions(pngData.width, pngData.height)`

- `src/resvg-js-wasm/`
  - `index.min.js` - vendored minified JS wrapper
  - `index_bg.wasm` - vendored Wasm binary (2.4MB)

### 1.2 Constraint verification

**Font-related code:** None found. ✓\
**BBox-related code:** None found. ✓\
**External `<image href>` in SVGs:** None found. ✓\
**Raw RGBA pixels usage:** None found. ✓

### 1.3 Test coverage

**No test files found** in the repository. This is a gap that should be
addressed, but adding tests is out of scope for this migration. The human should
add visual regression tests after migration.

---

## 2. Dependency changes

### 2.1 Additions

- Add `svg2png-wasm` to `deno.jsonc` imports map
- Vendor `svg2png_wasm_bg.wasm` from `node_modules/svg2png-wasm/` to
  `src/assets/svg2png-wasm/` (new directory)

### 2.2 Removals

- Remove `src/resvg-js-wasm/` directory entirely (both `index.min.js` and
  `index_bg.wasm`)
- Remove the `deno.jsonc` task `"copy:resvg": "cp -r src/resvg-js-wasm dist"`
  (line 17)
- Remove the `deno.jsonc` task
  `"fix-file-path": "deno run --allow-read --allow-write scripts/fix_resvg_wasm_file_path.ts"`
  (line 21)
- Remove the `deno.jsonc` task
  `"get-back-resvg-js-to-html": "deno run --allow-read --allow-write scripts/get_back_resvg_js_to_html.ts"`
  (line 22)
- Update `"postprocessing"` task to remove the two deleted tasks (line 25)

### 2.3 Static assets

- Create `src/assets/svg2png-wasm/` directory
- Copy `svg2png_wasm_bg.wasm` there after npm install
- Add new deno task: `"copy:svg2png-wasm": "cp -r src/assets/svg2png-wasm dist"`
- Update `"bulk-copy"` task to include the new copy task

---

## 3. Wasm initialization

**Location:** `src/js/page-specific/index/main.js`, line 85

**Current behavior:**

```js
await resvg.initWasm(fetch("../../../resvg-js-wasm/index_bg.wasm"));
```

**Proposed behavior:**

```js
import { initialize } from "svg2png-wasm";
await initialize(
  await Deno.readFile("../../../assets/svg2png-wasm/svg2png_wasm_bg.wasm"),
);
```

**Type of change:** Mechanical (direct API replacement)

**Note:** The initialization must happen before any `svg2png` call. The current
placement (in the IIFE before `executeSvg2png`) is correct.

---

## 4. File-by-file changes

### 4.1 `src/js/page-specific/index/state/resvg-option.js`

**Current state:**

```js
export const resvgOption = {
  fitTo: {
    mode: "height",
    value: 256,
  },
};
```

**Target state:**

```js
export const svg2pngOption = {
  height: 256,
};
```

**Type of change:** Mechanical (option mapping per migration guide §5)

**Note:** Rename the export from `resvgOption` to `svg2pngOption` for clarity.
Update all import sites accordingly.

---

### 4.2 `src/js/page-specific/index/svg-to-png.js`

**Current state (key sections):**

- Lines 70-103: `renderResources` object tracks `resvgJS` and `pngData` for
  `.free()` cleanup
- Line 118: `const resvgJS = new resvg.Resvg(svgString, resvgOption)`
- Line 123: `const pngData = resvgJS.render()`
- Line 126: `const pngBuffer = pngData.asPng()`
- Line 149: `updateDimensionInfo('png', pngData.width, pngData.height)`
- Lines 89-93: Cleanup calls `.free()` on both objects

**Target state:**

1. **Remove cleanup logic** (lines 70-103, 89-93, 114): `svg2png-wasm` does not
   require manual `.free()` calls
2. **Replace render logic** (lines 111-155):
   ```js
   async function svg2png(svgString, svg2pngOption) {
     // No cleanup needed - svg2png-wasm manages memory automatically

     // Render
     const pngUint8Array = await svg2png(svgString, svg2pngOption);

     // Create a blob and its url
     const blob = new Blob([pngUint8Array], { type: "image/png" });
     const blobUrl = URL.createObjectURL(blob);

     // Display the PNG img on output area
     document.querySelector("#output img").src = blobUrl;

     // Update the size and dimension info in HTML elements
     updateButtonWithPngSize(pngUint8Array);

     // PNG pixel dimensions - use IHDR helper
     const { width, height } = pngSize(pngUint8Array);
     updateDimensionInfo("png", width, height);

     // SVG viewBox dimension (unchanged)
     const viewboxValues = extractViewboxValues(svgString);
     updateDimensionInfo("svg", viewboxValues.get("w"), viewboxValues.get("h"));

     return pngUint8Array;
   }
   ```

3. **Add IHDR helper** (new function at top of file):
   ```js
   function pngSize(buf: Uint8Array): { width: number; height: number } {
       const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
       return { width: dv.getUint32(16), height: dv.getUint32(20) };
   }
   ```

**Type of change:** Mechanical with judgement (cleanup removal is
straightforward, but requires confirming no memory leaks in practice)

**Risks:**

- Removing `.free()` calls relies on Wasm GC. Monitor memory usage in browser
  DevTools after migration.
- The return type changes from the resvg-js object to `Uint8Array`. This affects
  `generate-and-upload.js`.

---

### 4.3 `src/js/page-specific/index/main.js`

**Current state:**

- Line 15: `import { resvgOption } from 'state/resvg-option'`
- Line 80:
  `const svgString = applyImageCustomization(initialDecodedSvgString, resvgOption)`
- Line 85: `await resvg.initWasm(fetch('../../../resvg-js-wasm/index_bg.wasm'))`
- Line 87: `executeSvg2png({ target: { value: svgString } }, resvgOption)`

**Target state:**

- Line 15: `import { svg2pngOption } from 'state/resvg-option'`
- Line 80:
  `const svgString = applyImageCustomization(initialDecodedSvgString, svg2pngOption)`
- Lines 84-86: Replace with:
  ```js
  import { initialize } from "svg2png-wasm";
  await initialize(
    await Deno.readFile("../../../assets/svg2png-wasm/svg2png_wasm_bg.wasm"),
  );
  ```
- Line 87: `executeSvg2png({ target: { value: svgString } }, svg2pngOption)`

**Type of change:** Mechanical

---

### 4.4 `src/js/page-specific/index/dynamic-ogp/generate-and-upload.js`

**Current state:**

- Line 42: `new Blob([pngData.asPng()], { type: 'image/png' })`
- Line 108: `calculateImageDimensions(pngData.width, pngData.height)`

**Target state:**

- Line 42: `new Blob([pngData], { type: 'image/png' })` (pngData is now
  `Uint8Array`, not an object)
- Line 108:
  `calculateImageDimensions(pngSize(pngData).width, pngSize(pngData).height)`

**Add IHDR helper** (import from svg-to-png.js or duplicate):

```js
function pngSize(buf: Uint8Array): { width: number; height: number } {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
}
```

**Type of change:** Mechanical

**Note:** Per user decision, allow duplication of `pngSize` helper in both files
to keep current structure.

---

### 4.5 `deno.jsonc`

**Current state:**

- Line 17: `"copy:resvg": "cp -r src/resvg-js-wasm dist"`
- Line 21:
  `"fix-file-path": "deno run --allow-read --allow-write scripts/fix_resvg_wasm_file_path.ts"`
- Line 22:
  `"get-back-resvg-js-to-html": "deno run --allow-read --allow-write scripts/get_back_resvg_js_to_html.ts"`
- Line 25:
  `"postprocessing": "deno task bulk-copy && deno task fix-file-path && deno task get-back-resvg-js-to-html"`
- Line 18:
  `"bulk-copy": "deno task copy:favicon && deno task copy:images && deno task copy:css && deno task copy:resvg"`

**Target state:**

- Remove lines 17, 21, 22
- Replace line 18 with:
  ```js
  "bulk-copy": "deno task copy:favicon && deno task copy:images && deno task copy:css && deno task copy:svg2png-wasm",
  ```
- Add new task after line 16:
  ```js
  "copy:svg2png-wasm": "cp -r src/assets/svg2png-wasm dist",
  ```
- Replace line 25 with:
  ```js
  "postprocessing": "deno task bulk-copy",
  ```

**Type of change:** Mechanical

---

### 4.6 `src/resvg-js-wasm/` (entire directory)

**Current state:** Directory contains `index.min.js` and `index_bg.wasm`

**Target state:** Delete entire directory

**Type of change:** Mechanical

---

## 5. Async refactor

### 5.1 Functions changing return type

**Already async:**

- `executeSvg2png` (line 27) - already async, no change needed
- `svg2png` (line 111) - already async, no change needed
- `measureSvg2pngTime` (line 236) - already async, no change needed
- `generateAndUploadImage` (line 14) - already async, no change needed

**No sync-to-async conversion needed** - the codebase already uses async
rendering with the old Wasm variant.

### 5.2 Cascading await updates

None required. All call sites already use `await` for the render functions.

---

## 6. Type changes

### 6.1 TypeScript types

The codebase appears to be JavaScript (no `.ts` files found). However, JSDoc
comments indicate expected types:

**In `svg-to-png.js`:**

- `pngData` parameter changes from resvg-js object to `Uint8Array`
- Return type of `svg2png()` changes from resvg-js object to `Uint8Array`

**In `generate-and-upload.js`:**

- `pngData` parameter changes from resvg-js object to `Uint8Array`

**Action:** Update JSDoc comments to reflect the new types.

---

## 7. Test plan

### 7.1 Existing tests

**None found.** This is a gap.

### 7.2 Recommended new tests (post-migration, human to add)

1. **Visual regression test:** Render a known SVG with both old and new
   libraries, compare pixel-by-pixel. They should be identical (both use resvg
   engine).
2. **IHDR round-trip test:** Verify the `pngSize` helper returns correct
   dimensions by comparing against known SVG viewBox.
3. **Async error path test:** Test error handling when invalid SVG is passed to
   `svg2png`.
4. **Memory leak test:** Run the render loop 100+ times in browser DevTools and
   monitor memory. Should not grow unbounded (validating that `.free()` removal
   is safe).

---

## 8. Build / bundle plan

### 8.1 Wasm file inclusion

**Current:** `src/resvg-js-wasm/index_bg.wasm` is copied to
`dist/resvg-js-wasm/` via `deno task copy:resvg`

**Target:** `src/assets/svg2png-wasm/svg2png_wasm_bg.wasm` will be copied to
`dist/assets/svg2png-wasm/` via new `deno task copy:svg2png-wasm`

**Verification:** After running `deno task build`, confirm:

- `dist/assets/svg2png-wasm/svg2png_wasm_bg.wasm` exists
- The bundled JS references the correct path:
  `../../../assets/svg2png-wasm/svg2png_wasm_bg.wasm`

### 8.2 Build config edits

**Changes required in `deno.jsonc`:** Documented in §4.5

### 8.3 Bundle verification

Run `deno task build` and verify:

- No errors during bundling
- The output `dist/index.html` loads in browser
- The Wasm file loads successfully (check Network tab in DevTools)
- SVG-to-PNG rendering works end-to-end

---

## 9. Rollout and rollback

### 9.1 Commit order

1. **Commit 1:** Add `svg2png-wasm` dependency and vendor Wasm file
   - `npm install svg2png-wasm`
   - Create `src/assets/svg2png-wasm/`
   - Copy Wasm file
   - Update `deno.jsonc` with new copy task

2. **Commit 2:** Update options and add IHDR helper
   - Modify `src/js/page-specific/index/state/resvg-option.js`
   - Add `pngSize` helper to `src/js/page-specific/index/svg-to-png.js`

3. **Commit 3:** Replace render logic in svg-to-png.js
   - Remove cleanup code
   - Replace render call with `svg2png`
   - Update dimension reading

4. **Commit 4:** Update main.js initialization
   - Replace `resvg.initWasm` with `initialize`
   - Update import names

5. **Commit 5:** Update generate-and-upload.js
   - Replace `.asPng()` usage
   - Add dimension reading via IHDR

6. **Commit 6:** Clean up old dependencies and build config
   - Delete `src/resvg-js-wasm/`
   - Update `deno.jsonc` tasks
   - Remove post-processing hacks

### 9.2 PR structure

Single PR with all 6 commits above. The PR description should reference this
migration plan.

### 9.3 Rollback procedure

If the migration breaks production:

1. Revert the PR
2. The old `src/resvg-js-wasm/` will be restored by git revert
3. The old `deno.jsonc` tasks will be restored
4. No data migration is needed (no database changes)

---

## 10. Open questions

**All questions resolved by user decisions:**

1. **Shared utility for `pngSize`:** Allow duplication in both files to keep
   current structure.
2. **Test coverage:** No tests needed for this migration.
3. **Memory leak validation:** Normal usage testing is sufficient.
4. **Browser vs Deno Deploy:** Deno Deploy is out of scope (future planning
   only). Experimental OGP code (hash calculations, etc.) should be left as-is
   if it doesn't cause errors.

---

## 11. Summary

This migration is **mechanical and low-risk**:

- The codebase already uses async rendering (no sync-to-async conversion needed)
- No fonts or BBox features are used (constraints satisfied)
- No external images in SVGs (no pre-processing needed)
- The main changes are: API replacement, option mapping, IHDR-based dimension
  reading, and cleanup removal

**Estimated effort:** 2-3 hours for implementation, plus testing time.

**Risk level:** Low. The underlying renderer (resvg) is identical; only the
JS/Wasm wrapper changes.
