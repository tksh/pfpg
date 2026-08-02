# Prompt: Plan the `resvg-js` → `svg2png-wasm` migration

Use this prompt when you want an AI coding agent to **read the migration
guide and produce a concrete, file-by-file migration plan** before any code
changes are made. The prompt is designed to be pasted at the start of a
session whose only job is planning (not executing).

---

## Prompt

You are an AI coding agent working in a repository that currently uses
`@resvg/resvg-js` to render SVGs to PNG. The user wants to migrate to
`svg2png-wasm`.

**Before you plan anything**, read these two files in order:

1. `./AGENTS.md` — the project-wide rules and your role within this codebase.
2. `./docs/resvg-js_to_svg2png-wasm_migration.md` — the migration guide
   written for this exact task.

Read both files fully before doing any work. Do not skim.

**Your task is planning only.** Do not edit source files, do not run
`npm install`, do not run `git apply`, do not commit anything. Your only
deliverable is a written migration plan.

The plan must include, for every change:

- The exact file path to be modified (or "no change").
- The function or section being changed.
- The current behavior (1–2 lines).
- The proposed behavior (1–2 lines).
- Whether the change is mechanical (a 1:1 rewrite) or requires design
  judgement.
- Any risks or follow-ups the human reviewer should know about.

**Required sections in your plan:**

1. **Inventory** — list every `import` of `@resvg/resvg-js` /
   `@resvg/resvg-wasm` and every call site. Confirm the §0 constraints in
   the migration guide (no fonts, no BBox) hold. If they do not, stop and
   report the violation; do not proceed with planning.
2. **Dependency changes** — what to add, what to remove, what static
   assets must be vendored.
3. **Wasm initialization** — where the single `await initialize(...)`
   call should live in the codebase. If the project has an existing boot
   sequence, place it there; if not, propose a new module.
4. **File-by-file changes** — one bullet per file, in the order files
   should be edited. For each: current state, target state, type of
   change (mechanical / judgement).
5. **Async refactor** — every function whose return type changes from
   `Buffer` / `Uint8Array` to `Promise<Buffer>` / `Promise<Uint8Array>`.
   Group by call site and identify the cascading `await` updates
   required.
6. **Type changes** — list every TypeScript type that needs updating,
   including exported types in shared modules.
7. **Test plan** — what tests exist that will exercise the change, and
   any new tests the human should add (e.g. a pixel-equality test against
   a stored baseline, an IHDR round-trip test, an async-error-path test).
8. **Build / bundle plan** — confirm the Wasm file is included in the
   output, confirm `deno bundle` (or equivalent) still passes, and list
   any build-config edits required.
9. **Rollout and rollback** — the order of commits, the PR structure,
   and how to revert if the migration breaks the build.
10. **Open questions** — anything the human needs to decide before
    execution. If there are no open questions, say so explicitly.

**Constraints you must respect:**

- The migration guide's §0 constraints (no fonts, no BBox) are hard
  constraints. If the plan requires adding font or BBox code, the plan is
  wrong — go back to the inventory step and re-examine the assumptions.
- The plan must not introduce new dependencies beyond `svg2png-wasm`
  itself, unless a specific dependency is justified by an existing
  pre-migration need (e.g. a PNG decoder that was already in use).
  A PNG decoder must **not** be added solely to read image dimensions;
  the IHDR helper from §3 of the guide is the prescribed approach.
- The plan must not propose native `resvg` binaries, zopfli, or other
  PNG re-compressors.
- The plan must respect the conventions laid out in `AGENTS.md`. If the
  plan conflicts with `AGENTS.md`, defer to `AGENTS.md` and note the
  conflict in §10 (Open questions).
- Prefer the smallest possible diff. Resist the temptation to refactor
  unrelated code, rename symbols, or "improve" surrounding logic while
  you are in the file.

**How to deliver:**

Write the plan as a single markdown document. Save it to
`./docs/migration-plan.md` and surface a short summary (≤15 lines) in
your final reply that points to it. Do not start execution; wait for the
human to approve the plan.

If at any point you discover that the migration guide is missing
information required to plan correctly, stop and ask the human a single
focused question. Do not invent requirements.

---

## After the plan is approved

The same agent (or a new one in a fresh session) can be invoked to
**execute** the plan. A separate execution prompt is recommended, scoped
only to:

- Reading `AGENTS.md`
- Reading `docs/migration-plan.md`
- Executing the plan step by step
- Running the project's test suite
- Reporting results

Do not combine planning and execution in a single session. The
separation exists so that the human can review the plan in isolation
from the code churn of execution.
