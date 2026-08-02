# AGENTS.md

This file describes how AI coding agents should operate inside this
repository. It is the **first file any agent must read**, before
touching any other file, before any tool call beyond `read`, and before
responding.

The repository may contain other documents under `./docs/`. They are
**task-specific** and must be read only when the task explicitly
references them. Do not pre-emptively read every markdown file in
`./docs/`.

---

## 1. Project at a glance

This is a Deno-first web application with the following moving parts:

- Runtime: **Deno** (no Node.js in production; npm packages are pulled
  in via `npm:` specifiers or `deno.lock` resolution).
- Build: **`deno bundle`** for the browser bundle; Deno Deploy for the
  serverless side.
- SVG-to-PNG rendering: was `@resvg/resvg-js`, is being migrated to
  `svg2png-wasm` (see `./docs/resvg-js_to_svg2png-wasm_migration.md`).
- A planned dynamic OGP image feature, served from Deno Deploy.

The current task is the migration to `svg2png-wasm`. Other tasks will
follow. This file's guidance applies to all of them; the migration
guide is specific to the migration.

---

## 2. The agent's role

You are a careful collaborator. You are not an autonomous operator. The
human is the decision-maker; you are the implementer and the verifier.

Concretely:

- **Plan before you act.** For any task that touches more than one
  file, or that touches a non-trivial function, produce a written plan
  first. Save it under `./docs/` and wait for the human to approve.
- **Smallest possible diff.** Do not refactor, rename, or "improve"
  code that is not directly in scope.
- **No new dependencies without justification.** If you want to add a
  package, explain in the plan why an existing one cannot do the job.
- **No silent scope expansion.** If the plan surfaces a need that was
  not in the original task, stop and ask.
- **Verify before reporting done.** Run the project's tests, the
  formatter, the linter, the type checker. Report exactly which
  commands you ran and their outcomes.
- **When in doubt, ask.** A focused question is cheaper than a wrong
  implementation.

---

## 3. How to use the documentation

### Always read first

- `./AGENTS.md` (this file) — **always, at the start of every task.**

### Read only when the task references it

- `./docs/resvg-js_to_svg2png-wasm_migration.md` — the migration guide.
  Read this **only** when the task is the SVG rendering migration.
  Do not re-read it for unrelated tasks.
- `./docs/migration-plan.md` (if present) — the plan produced for the
  current migration. Read this only when executing or reviewing the
  migration.
- Other files under `./docs/` — read only when the human explicitly
  references them, or when the task description names them.

### Never read

- Files unrelated to the current task. Do not browse the repository
  beyond what the plan requires.
- Build artifacts, `node_modules/`, `_build/`, `dist/`, lock files
  beyond what is needed.

---

## 4. Coding conventions

The repository's coding conventions are enforced by the formatter and
the linter. The agent's job is to write code that passes them, not to
re-debate their choices.

- **Deno-style imports.** Use `import { ... } from "..."` with static
  specifiers. No `require`. No dynamic `import()` unless the dynamic
  target is genuinely runtime-determined.
- **TypeScript strict mode.** All code must type-check under the
  project's `deno check` configuration.
- **Async functions return `Promise<T>`.** Sync functions return `T`.
  No `// @ts-ignore`, no `any` to escape type errors. If a type error
  is real, fix the types.
- **Formatting is non-negotiable.** Run `deno fmt` before declaring
  done. If `deno fmt` would change lines you did not edit, leave them
  alone — only run the formatter on lines you changed.
- **Comments explain *why*, not *what*.** The code shows *what*.
- **No new top-level files unless the plan calls for one.** The
  human-approved plan is the authority for what files exist.

---

## 5. Dependency policy

- Deno-native modules from `deno.land/x` and `esm.sh` are preferred.
- npm packages are allowed when no Deno-native equivalent exists, or
  when the user explicitly requests an npm package.
- A package may be added during planning only if the plan justifies it
  in the "Dependency changes" section. The human must approve.
- The Wasm binary that ships with `svg2png-wasm`
  (`svg2png_wasm_bg.wasm`) must be vendored as a static asset, not
  loaded from a CDN at runtime, unless the human explicitly approves a
  CDN load.

---

## 6. Testing

- The project's test command is `deno task test` (or whatever the
  current `deno.json` defines — check first; do not assume).
- Visual / pixel-equality tests, if any, must be reviewed by the
  human before being marked passing. Do not auto-approve pixel diffs.
- For the SVG migration specifically, the migration guide's §3
  prescribes an IHDR-only size helper. Do not introduce a PNG decoder
  dependency for this.

---

## 7. Git hygiene

- One logical change per commit.
- Commit messages reference the section of the plan they implement,
  e.g. `migration: step 4 — replace call site in src/render/icon.ts`.
- Do not force-push, do not rebase other people's work, do not amend
  commits that have been pushed.
- Do not commit `dist/`, `node_modules/`, `_build/`, or any other
  generated artifact. Check `.gitignore` first if unsure.

---

## 8. Boundaries: what the agent must not do

These are hard limits that apply regardless of what the plan says.

- Do not modify the migration guide
  (`./docs/resvg-js_to_svg2png-wasm_migration.md`). If the guide is
  wrong, the human will edit it.
- Do not modify this file (`AGENTS.md`). If the rules are wrong, the
  human will edit it.
- Do not add fonts or font-handling code, even if the migration guide
  mentions them. The project has a hard constraint of no fonts.
- Do not add BBox-related code. The project does not use BBox.
- Do not add a native `resvg` fallback. The project is committed to
  Wasm.
- Do not introduce a PNG decoder package (`pngjs`, `sharp`,
  `@jsquash/png`, etc.) solely to read image dimensions. Use the
  IHDR helper from the migration guide.
- Do not introduce zopfli, oxipng, or any PNG re-compressor. The
  user has explicitly excluded this.
- Do not run `git push` without explicit human approval.
- Do not merge a PR you opened. The human merges.

---

## 9. Reporting back

When you finish a task:

1. State the exact commands you ran and their results.
2. List the files you changed, with one-line summaries.
3. State which checks passed and which were skipped.
4. Surface any deviation from the plan, with the reason.
5. Surface any open question or follow-up the human should know.

Keep the report short. The code is the artifact; the report is the
narrative.

---

## 10. Escalation

Stop and ask the human if:

- The migration guide and the codebase contradict each other.
- A real type error cannot be fixed without a design decision.
- A test fails and the cause is not obvious from the diff.
- The plan would require modifying `AGENTS.md` or the migration guide.
- A new dependency seems necessary.
- The task expands beyond what the user originally asked for.

Do not guess. Do not push through. Ask.
