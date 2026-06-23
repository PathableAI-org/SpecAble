# Implementation Plan: SpecAble v0 — Product Primitive Graph

**Branch**: `001-product-primitives-v0` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-product-primitives-v0/spec.md`

## Summary

Deliver SpecAble v0 as a local-first, open-source **single-package** Effect TypeScript workspace (`@specable/cli`) that loads YAML primitive fixture graphs, validates them against the canonical Notion Product Primitives ontology with status-aware strictness (`Draft` / `Active` / `Deprecated`), reports relationship integrity issues, and generates deterministic Markdown summaries and JSON reports via a `specable check` CLI.

Technical approach: Effect Schema for all boundaries, graph services for load/traverse/validate/summarize inside `packages/cli/src/*`, `@effect/cli` + `@effect/platform-node` for the command surface, `@effect/vitest` for tests, and repository boilerplate adapted from `PathableAI-org/effect-typescript-template` for CI, lint, codegen, Changesets, and Fallow.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022 target (template-aligned)

**Primary Dependencies**: `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@effect/build-utils`, `yaml` (fixture parsing only at boundary)

**Storage**: Local YAML graph project directories (one file per primitive type); JSON artifact outputs with `--out`

**Testing**: Vitest 4 + `@effect/vitest`; synthetic fixtures under `packages/cli/examples/` and `packages/cli/test/fixtures/`

**Target Platform**: Node.js 20+ local CLI (CI pins Node 24.x); Linux/macOS/WSL; fully offline

**Project Type**: pnpm monorepo with **one** workspace package (`packages/cli`) containing library modules + CLI adapter

**Performance Goals**: Generic valid example validates in <5s on typical laptop (SC-002)

**Constraints**: No Notion/MCP/cloud runtime deps; deterministic summary/story generation; stdout-default CLI; strict TS (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)

**Scale/Scope**: v0 supports tens–low hundreds of primitives per graph; two bundled examples + invalid variants; 9 primitive types + relationship roles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ |
| II. Adapter-based | Is core logic free of Notion/Jira/Linear/GitHub/Figma/etc. dependencies? Are integrations adapter-only? | ✅ YAML loader only; Notion is spec source encoded locally |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query/validation/generation prioritized over write-back automation? | ✅ MCP deferred; read/validate/generate via CLI |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ⚠️ see Complexity Tracking |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ Effect Schema + output contracts |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ |
| VIII. Vertical slice | Does this slice produce a demoable outcome (validate, summarize, query, detect gaps)? | ✅ |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform, or vendor replacement ambitions? | ✅ |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ |

**Post-design re-check**: All gates pass with documented v0 single-package exception for Principle V.

## Project Structure

### Documentation (this feature)

```text
specs/001-product-primitives-v0/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-commands.md
│   ├── fixture-format.md
│   └── output-artifacts.md
└── tasks.md                 # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
SpecAble/
├── .changeset/
│   └── config.json              # repo: PathableAI-org/SpecAble
├── .github/
│   ├── actions/setup/action.yml
│   └── workflows/
│       ├── check.yml
│       ├── fallow-audit.yml
│       ├── release.yml
│       └── snapshot.yml         # optional pkg.pr.new; skip if app missing
├── .fallowrc.json               # workspaces: packages/cli only
├── AGENTS.md                    # adapted from effect-typescript-template
├── eslint.config.mjs            # flat config + @effect/eslint-plugin
├── package.json                 # root scripts (codegen/check/lint/test/...)
├── pnpm-workspace.yaml
├── scripts/
│   └── clean.mjs
├── tsconfig.base.json
├── tsconfig.json                # references packages/cli only
├── tsconfig.build.json
├── vitest.config.ts
└── packages/
    └── cli/
        ├── package.json         # @specable/cli
        ├── tsconfig.json
        ├── tsconfig.src.json
        ├── tsconfig.test.json
        ├── tsconfig.build.json
        ├── src/
        │   ├── bin.ts           # Node entry (Command.run)
        │   ├── index.ts         # generated exports
        │   ├── cli/
        │   │   └── CheckCommand.ts
        │   ├── domain/          # Schemas, enums, tagged errors
        │   ├── graph/           # Load YAML, index, traverse
        │   ├── validation/      # Rules engine (status-aware)
        │   ├── integrity/       # Duplicates, derivations, advisories
        │   ├── summary/         # Markdown + preview
        │   ├── story/           # Template text generation
        │   └── services/        # FileSystem, GraphLoader Layer
        ├── test/                # @effect/vitest suites
        └── examples/
            ├── generic/{valid,invalid}/
            └── coachbridge-synthetic/{valid,invalid}/
```

**Structure Decision**: v0 intentionally uses **one workspace package** (`packages/cli`) with internal library modules instead of `packages/domain` + `packages/cli`. CLI files under `src/cli/` and `src/bin.ts` remain thin wrappers over testable modules. This mirrors template tooling while honoring the user's one-package constraint.

### Root scripts (template-equivalent)

| Script | Command |
|--------|---------|
| `pnpm codegen` | `pnpm --filter @specable/cli run codegen` |
| `pnpm check` | `tsc -b tsconfig.json` |
| `pnpm typecheck` | alias → `pnpm check` |
| `pnpm lint` | eslint flat config over `**/{src,test,examples,scripts}/**/*.{ts,mjs}` |
| `pnpm lint-fix` | `pnpm lint --fix` |
| `pnpm test` | vitest root config |
| `pnpm coverage` | vitest --coverage |
| `pnpm build` | `tsc -b tsconfig.build.json && pnpm --filter @specable/cli run build` |
| `pnpm clean` | `node scripts/clean.mjs` |

### TypeScript configs

- Root `tsconfig.base.json`: strict template settings + `@effect/language-service` plugin + path alias `@specable/cli` → `packages/cli/src/index.ts`
- Root `tsconfig.json`: project references → **`packages/cli` only**
- Root `tsconfig.build.json`: build graph for publishable output
- Package configs: `tsconfig.src.json`, `tsconfig.test.json`, `tsconfig.build.json` following template layout

## Phase 0 — Research

Completed in [research.md](./research.md). All Technical Context items resolved; no remaining `NEEDS CLARIFICATION`.

Key decisions: Effect Schema, YAML fixtures, `@effect/cli check`, stdout + `--out`, Changesets for OSS publish, Fallow scoped to single package.

## Phase 1 — Design & Contracts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| CLI contract | [contracts/cli-commands.md](./contracts/cli-commands.md) |
| Fixture contract | [contracts/fixture-format.md](./contracts/fixture-format.md) |
| Output contract | [contracts/output-artifacts.md](./contracts/output-artifacts.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Implementation sequencing (for `/speckit-tasks`)

1. **Repo bootstrap** — template scripts, TS configs, ESLint, CI, AGENTS.md, Changesets, Fallow config (no domain logic).
2. **Domain schemas** — nine primitive types, status, references, tagged errors.
3. **Graph loader** — YAML per-type files → `ProductGraph` Layer.
4. **Validation engine** — status-aware required field + relationship rules (FR-010–FR-026).
5. **Integrity engine** — duplicates, triples, advisories, workflow derivations.
6. **Story + summary** — template text, Markdown sections, preview truncation.
7. **CLI** — `specable check` wiring, stdout/`--out` writers, exit codes.
8. **Examples + tests** — generic + coachbridge synthetic; SC-003 engineered fixtures.

### Test categories (constitution-mandated)

- Schema decode per primitive file
- Graph traversal / index lookups
- Missing-link + orphan detection with severity
- Duplicate names + likely duplicates + story triples
- Summary determinism + gap sections
- Loader behavior for missing type files
- CLI exit codes and `--out` artifacts

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| V. Library-first: domain inside `packages/cli` not separate `packages/domain` | User-mandated one-package v0 workspace; reduces bootstrap overhead while modules stay extraction-ready | Separate domain package now adds cross-package codegen/build wiring before first demo |
| IV. MCP-first: CLI only in v0 | Spec explicitly defers MCP; CLI proves validate/summary slice first | Building MCP server before CLI completes vertical slice without user-visible CLI demo |
| Snapshot workflow included but non-blocking | Template parity for future pkg.pr.new previews | Omitting workflow entirely would require re-adding CI later; template skip-on-missing-app pattern is low cost |

## Repository boilerplate checklist (implementation)

- [ ] Root `package.json` + `pnpm-workspace.yaml` (`packages/*`)
- [ ] TS configs (root + `packages/cli/*`)
- [ ] `eslint.config.mjs` with `@effect/eslint-plugin`
- [ ] `vitest.config.ts` + `@effect/vitest` setup
- [ ] `scripts/clean.mjs`
- [ ] `.fallowrc.json` (workspaces → `packages/cli` only)
- [ ] `.changeset/config.json` (`PathableAI-org/SpecAble`)
- [ ] `.github/actions/setup` + workflows (`check`, `fallow-audit`, `release`, `snapshot`)
- [ ] `AGENTS.md` adapted for SpecAble single-package layout
- [ ] `README.md` sections: commands, package layout, Effect guidance, publishing, template adaptation

## Phase 2

Task breakdown deferred to `/speckit-tasks` → [tasks.md](./tasks.md).
