`libpfpg` is the DOM-free seed of the future `@tksh/libpfpg` package. Its
modules must not use `document`, `location`, `fetch`, or `import.meta.hot`;
imports are limited to `@tksh/*` packages and the standard library.

## JSR publication

- `mod.ts` is the package root: it re-exports the public API explicitly instead
  of exposing every internal helper.
- `deno.jsonc` is the JSR manifest (`name`, `exports`, strict compiler options).
  Its dependency versions mirror `pfpg/deno.jsonc`.
- `.github/workflows/publish-libpfpg.yml` publishes on `libpfpg-v*.*.*` tags,
  using `--set-version` so no version is stored in the manifest. The distinct
  tag prefix keeps it independent of any app-level tag.
- **Publication is intentionally deferred until Favorites is implemented**
  (`lsvg-memo/pfpg/2026-11-03/43_...` §6). Do not push a `libpfpg-v*` tag yet.
  The workflow is a dormant shell until that decision is reversed.
- `tests/libpfpg_purity_test.ts` enforces the purity contract for every `.ts`
  file in this directory, including `mod.ts`. Keep it green before publishing.
- When publication is approved, the app's 11 `libpfpg/*` import aliases and
  their call sites are replaced by `@tksh/libpfpg` imports in one pass.
