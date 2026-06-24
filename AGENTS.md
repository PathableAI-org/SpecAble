# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This is a **Spec Kit (spec-driven development) repository**, not a built application. The
planned product is **SpecAble v0** (`@specable/cli`, an offline CLI), but it has **not been
scaffolded yet**: there is no `package.json`, no lockfile, and no `src/` code. The repo
currently contains only specs and Spec Kit tooling under `specs/` and `.specify/`.

The full product intent lives in `specs/001-product-primitives-v0/` — start with `spec.md`,
`plan.md`, `quickstart.md`, and `tasks.md`. The planned setup/run/test commands
(`pnpm install` → `pnpm codegen` → `pnpm check` → `pnpm test` → `pnpm build`, and
`specable check <dir>`) are documented in `specs/001-product-primitives-v0/quickstart.md`;
do not duplicate them — they only work **after** the project is implemented.

### Toolchain (already installed; no install step needed for the current repo)
Node 22, npm, Corepack, pnpm (via Corepack), `jq`, `python3`, `git`, `bash` are all present.
The planned project targets Node 20+/pnpm 11.x; Corepack will fetch the pnpm version pinned
in `package.json` (`packageManager` field) once that file exists.

### The runnable "application" today = Spec Kit workflow tooling
Until the product is implemented, the only runnable thing is the spec-driven workflow,
driven by the `speckit-*` skills which call the bash scripts in
`.specify/scripts/bash/` (e.g. `check-prerequisites.sh`, `create-new-feature.sh`,
`setup-plan.sh`, `setup-tasks.sh`).

Non-obvious caveats:
- These scripts resolve the repo root by searching **upward from the current working
  directory** for the nearest `.specify/` dir. Always run them from `/workspace` (or set
  `SPECIFY_INIT_DIR=/workspace`). Running from a temp dir that contains a copied `.specify/`
  will silently resolve to that copy instead.
- Active feature context comes from `.specify/feature.json` (`feature_directory`) or the
  `SPECIFY_FEATURE_DIRECTORY` env var. It currently points at
  `specs/001-product-primitives-v0`. The scripts persist this file, so prefer running
  destructive/scaffolding scripts (like `create-new-feature.sh`) in a throwaway copy if you
  do not intend to change repo state.
- `python3` and `jq` are optional fallbacks the scripts use for JSON/YAML parsing; both are
  installed here, so JSON output paths are exercised.

### When you implement the product
After scaffolding `package.json` + `pnpm-workspace.yaml`, the startup update script will
automatically run `pnpm install` (it is guarded to no-op while no `package.json` exists).
Use the workflow in `quickstart.md` for codegen/lint/test/build.
