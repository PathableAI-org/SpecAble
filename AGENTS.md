# AGENTS.md

This repository is [PathableAI-org/SpecAble](https://github.com/PathableAI-org/SpecAble) — an open-source, local-first **Product Primitive Graph** CLI built with Effect.

Keep this file concise and update it when repository structure, commands, or conventions change.

## Project Purpose

SpecAble v0 validates local YAML primitive fixture graphs against the canonical Product Primitives ontology, reports relationship integrity issues, and generates deterministic Markdown summaries and JSON reports via the `specable check` command.

Prefer explicit schemas, typed errors, visible service requirements, deterministic tests, and examples that coding agents can safely imitate.

This repository targets the latest stable Effect v3 release. Do not introduce Effect v4 APIs until the project explicitly adopts Effect v4.

## Repository Structure

v0 uses a **single workspace package** (`@specable/cli`) with internal library modules. There is no separate `packages/domain` or `packages/server` package.

- `packages/cli`: Publishable package containing all library modules, CLI commands, and the executable.
  - `src/domain/`: Schemas, enums, tagged errors, and primitive type definitions.
  - `src/graph/`: YAML loading, graph indexing, and traversal.
  - `src/validation/`: Status-aware validation rules engine (`Draft` / `Active` / `Deprecated`).
  - `src/integrity/`: Duplicate detection, story triples, derivations, and advisories.
  - `src/summary/`: Markdown summary and preview generation.
  - `src/story/`: Deterministic story text generation.
  - `src/cli/`: `@effect/cli` command definitions (thin adapters).
  - `src/services/`: FileSystem, GraphLoader, and Layer composition.
  - `src/bin.ts`: Node executable entry (`Command.run`).
  - `test/`: `@effect/vitest` suites and synthetic fixtures.
  - `examples/`: Bundled graph projects (`generic/`, `coachbridge-synthetic/`).
- `scripts/`: Repository maintenance scripts (e.g. `clean.mjs`).
- `.github/workflows`: Pull request checks, Fallow analysis, and release automation.
- `specs/`: Feature specifications, plans, contracts, and quickstart guides.
- `.specify/`: Spec Kit workflow tooling and scripts.

Executable entrypoint:

- `packages/cli/src/bin.ts`

Importing `@specable/cli` must not execute the CLI or acquire live resources. Runtime execution belongs in `bin.ts` only.

## Architecture Rules

- Validate untrusted and serialized data with `Schema` (`@effect/schema`).
- Represent expected failures as tagged, serializable errors.
- Put external systems (filesystem, YAML parsing) behind Effect services.
- Keep domain types and service contracts independent of live infrastructure.
- Provide separate live and test Layers for services.
- Keep internal Layer composition within the module or feature that owns it.
- Compose published feature Layers at the CLI composition root (`src/services/`).
- Keep runtime execution in `src/bin.ts` and thin CLI command adapters under `src/cli/`.
- Use scoped resource management for acquired resources.
- Use `Config` and `Redacted` for configuration and secrets.
- Name important operations with `Effect.fn` when it improves tracing.
- Use Effects instead of Promise-based service contracts.
- Use defects only for unexpected, unrecoverable failures.
- Avoid `any`, unchecked casts, floating Effects, and hidden requirements.
- Keep library modules (`domain/`, `graph/`, `validation/`, etc.) free of CLI-specific output formatting where possible.

Before introducing an abstraction, look for an existing local example that can be extended.

## Effect Guidance

Do not rely on model memory for Effect APIs.

Before implementing an unfamiliar Effect pattern:

1. Inspect the closest local example under `packages/cli/src/`.
2. Consult version-matched guidance at [effect.website](https://effect.website/docs/).
3. Consult the official documentation at [effect.website/docs](https://effect.website/docs/).
4. Confirm the API against the installed package types in `node_modules/effect`.

Prefer patterns compatible with the versions recorded in `pnpm-lock.yaml`.

## Commands

Run commands from the repository root.

- Install: `pnpm install --frozen-lockfile`
- Generate exports: `pnpm codegen`
- Typecheck: `pnpm check` (alias: `pnpm typecheck`)
- Lint and formatting check: `pnpm lint`
- Apply lint and formatting fixes: `pnpm lint-fix`
- Test: `pnpm test`
- Coverage: `pnpm coverage`
- Build packages: `pnpm build`
- Clean generated output: `pnpm clean`

Use the `@specable/cli` filter for focused package work (`pnpm build` required before `specable`):

```sh
pnpm --filter @specable/cli test
pnpm --filter @specable/cli coverage
pnpm --filter @specable/cli run codegen
pnpm build
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid
```

Run the complete validation suite before requesting review:

```sh
pnpm codegen
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm exec fallow audit --base main --format json --quiet
```

After code generation, confirm that generated source changes are committed.

## Testing Rules

- Use `@effect/vitest` for Effect programs.
- Test service logic with test Layers instead of live infrastructure.
- Cover every tagged-error path introduced by a change.
- Use deterministic clocks and controlled services for time-dependent behavior.
- Test Schema decoding at system boundaries (YAML fixtures, CLI output DTOs).
- Keep fixtures and examples synthetic under `packages/cli/test/fixtures/` and `packages/cli/examples/`.
- Documentation examples must compile or execute as tests.
- Add type-level tests when runtime tests cannot verify the contract.

Required test categories for SpecAble v0:

- Schema decode per primitive type
- Graph traversal and index lookups
- Missing-link and orphan detection with severity
- Duplicate names, likely duplicates, and story triples
- Summary determinism and gap sections
- Loader behavior for missing type files
- CLI exit codes and `--out` artifacts

Placeholder tests do not count as coverage for new behavior.

## Logging And Sensitive Data

- Do not log fixture contents, report bodies, secrets, or user-provided text at info level.
- Prefer identifiers, counts, operation names, and non-sensitive metadata.
- Store secrets with `Config.redacted` or an equivalent `Redacted` value.
- Never commit credentials, production data, or private logs.
- Review error causes before exposing them through CLI output.

## Package And Publishing Rules

- Use explicit package exports generated through `@effect/build-utils` (`pnpm codegen`).
- Do not manually edit generated export files (`packages/cli/src/index.ts`).
- Keep package metadata, repository URLs, licenses, and publish settings valid.
- Add a Changeset for changes to `@specable/cli` unless explicitly exempt.
- **Pre-MVP**: changesets accumulate on `main`; do not merge the bot's **Version Packages** PR until maintainers enter alpha prerelease mode (`pnpm changeset-pre-enter-alpha`). See `.changeset/README.md`.
- **Alpha releases**: while `.changeset/pre.json` exists, versions are `x.y.z-alpha.N` and npm publishes use the `alpha` dist-tag.
- **Stable releases**: run `pnpm changeset-pre-exit` before the first non-prerelease publish.
- Keep Effect ecosystem dependencies compatible and update them as a group.
- Effect dependency updates require review and must not auto-merge.
- Do not change the repository license without an explicit project decision.

## Fallow

Use Fallow as a repository-analysis aid, not as a substitute for understanding the code.

Fallow is scoped to `packages/cli` via `.fallowrc.json`.

- Run `fallow audit --base main --format json --quiet` before committing AI-generated changes.
- Use `fallow dead-code --format json --quiet` before removing unused code.
- Use `fallow dupes --format json --quiet` before consolidating duplication.
- Use `fallow health --format json --quiet` to identify architectural hotspots.
- Verify recommendations against exports, generated code, entrypoints, and Layer composition.

| When the agent is about to... | Run |
|---|---|
| delete an "unused" export or file | `fallow dead-code --trace:<symbol>` |
| delete an "unused" dependency | `fallow dead-code --trace-dependency <pkg>` |
| commit or open a PR | `fallow audit --base <branch>` |
| prioritize refactoring | `fallow health --hotspots --targets` |
| ask who owns code | `fallow health --ownership` |
| check untested-but-reachable code | `fallow health --coverage-gaps` |
| consolidate duplication | `fallow dupes --trace dup:<id>` |
| find feature flags | `fallow flags` |
| surface security candidates | `fallow security` |
| understand a finding | `fallow explain <id>` |
| scope a monorepo | `--workspace <path>` / `--changed-workspaces` |

## Change Discipline

- Keep changes focused on the requested behavior.
- Preserve internal module boundaries (`domain/`, `graph/`, `validation/`, etc.) unless the task changes the architecture.
- Do not edit generated, vendored, or lockfile content manually.
- Do not add dependencies when an installed dependency already solves the problem.
- Do not hide type errors with casts or weaker compiler settings.
- Do not leave placeholders in executable, publishing, or CI configuration.
- Update documentation when commands, boundaries, or public behavior change.
- Record unresolved architectural questions instead of inventing conventions.

## Completion Checklist

Before declaring work complete:

- relevant behavior has focused tests;
- expected failures remain in the typed error channel;
- live infrastructure is isolated behind services and Layers;
- imports do not trigger runtime side effects;
- generated exports are current (`pnpm codegen`);
- documentation and examples remain accurate;
- no sensitive content is logged;
- typecheck, lint, tests, build, and Fallow checks pass;
- publishable changes include an appropriate Changeset.

## Cursor Cloud specific instructions

### What this repo is

This is a **Spec Kit (spec-driven development) repository** implementing **SpecAble v0**
(`@specable/cli`, an offline CLI). Product specs live under `specs/001-product-primitives-v0/`
— start with `spec.md`, `plan.md`, `quickstart.md`, and `tasks.md`. The monorepo is
scaffolded at the repository root (`package.json`, `pnpm-workspace.yaml`, `packages/cli/`).

For end-to-end CLI behavior (`specable check <dir>`), see `specs/001-product-primitives-v0/quickstart.md`
as features land in later phases.

### Toolchain

Node 20+ and pnpm 11.x (pinned via `packageManager` in root `package.json`). Corepack fetches
the correct pnpm version. `jq`, `python3`, `git`, and `bash` are used by Spec Kit scripts.

### Spec Kit workflow tooling

The spec-driven workflow is driven by `speckit-*` skills which call bash scripts in
`.specify/scripts/bash/` (e.g. `check-prerequisites.sh`, `create-new-feature.sh`,
`setup-plan.sh`, `setup-tasks.sh`).

Non-obvious caveats:

- These scripts resolve the repo root by searching **upward from the current working
  directory** for the nearest `.specify/` dir. Run them from the repo root (the directory
  that contains `.specify/`), or set `SPECIFY_INIT_DIR` to that path. Running from a temp dir
  that contains a copied `.specify/` will silently resolve to that copy instead.
- Active feature context comes from `.specify/feature.json` (`feature_directory`) or the
  `SPECIFY_FEATURE_DIRECTORY` env var. It currently points at
  `specs/001-product-primitives-v0`. The scripts persist this file, so prefer running
  destructive/scaffolding scripts (like `create-new-feature.sh`) in a throwaway copy if you
  do not intend to change repo state.
- `python3` and `jq` are optional fallbacks the scripts use for JSON/YAML parsing; both are
  installed in Cursor Cloud, so JSON output paths are exercised.

### Product development

Run `pnpm install --frozen-lockfile` from the repository root, then use the **Commands**
section above for codegen, lint, test, and build. Guard any automated startup scripts to
no-op when `package.json` is missing (relevant for forks or partial checkouts).
