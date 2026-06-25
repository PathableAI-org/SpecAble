# Implementation Plan: SpecAble v0 — Product Primitive Graph

**Branch**: `001-product-primitives-v0` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-product-primitives-v0/spec.md` (updated with Session 2026-06-24 clarifications: `@specable/domain` package split, Schema literal unions, annotation-first validation, JSON-only fixtures, exit code policy, duplicate-name warnings)

## Summary

Deliver SpecAble v0 as a local-first, open-source **two-package** Effect TypeScript workspace: `@specable/domain` (primitive schemas, closed-set Schema literal unions, references, domain decode errors) and `@specable/cli` (graph loading, status-aware validation, integrity analysis, summary generation, and `specable check` CLI). The CLI package depends on the domain package; graph behavior and rules beyond Effect Schema capabilities live only in `@specable/cli`.

Technical approach: Effect Schema with annotations for semantic meaning and field-level validation in `@specable/domain`; no native TypeScript `enum`; **JSON-only** graph project fixtures decoded at the CLI adapter boundary via `JSON.parse`; `@effect/cli` + `@effect/platform-node` for the command surface; comprehensive tests in `@specable/cli`, minimal encode/decode tests in `@specable/domain`.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022 target (template-aligned)

**Primary Dependencies**: `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@effect/build-utils` (no YAML parser; JSON fixtures use Node built-in parse)

**Storage**: Local JSON graph project directories (one `.json` file per primitive type); JSON artifact outputs with `--out`

**Testing**: Vitest 4 + `@effect/vitest`; `@specable/domain` — minimal schema encode/decode tests for complex compositions; `@specable/cli` — full constitution-mandated suites with fixtures under `packages/cli/examples/` and `packages/cli/test/fixtures/`

**Target Platform**: Node.js 20+ local CLI (CI pins Node 24.x); Linux/macOS/WSL; fully offline

**Project Type**: pnpm monorepo with **two** workspace packages: `@specable/domain` (`packages/domain`) and `@specable/cli` (`packages/cli`, depends on domain)

**Performance Goals**: Generic valid example validates in <5s on typical laptop (SC-002)

**Constraints**: No Notion/MCP/cloud runtime deps; deterministic summary/story generation; stdout-default CLI; strict TS (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`); closed-set values as Schema literal unions only (FR-057); domain package is schema-only (FR-058); **no `any`**; **avoid type casts**; **hide storage I/O behind repository services** (constitution v1.1.0)

**Scale/Scope**: v0 supports tens–low hundreds of primitives per graph; two bundled examples + invalid variants; 9 primitive types + relationship roles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ |
| II. Adapter-based | Is core logic free of Notion/Jira/Linear/GitHub/Figma/etc. dependencies? Are integrations adapter-only? | ✅ JSON loader in CLI only; Notion is spec source encoded locally |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query/validation/generation prioritized over write-back automation? | ✅ MCP deferred; read/validate/generate via CLI |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ `@specable/domain` library + thin `@specable/cli` adapter |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ Effect Schema + annotations + output contracts |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ |
| VIII. Vertical slice | Does this slice produce a demoable outcome (validate, summarize, query, detect gaps)? | ✅ |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform, or vendor replacement ambitions? | ✅ |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ |

**Post-design re-check (2026-06-24)**: All gates pass. Session 2026-06-24 clarifications resolve the prior Principle V single-package exception and align fixture format (JSON-only), exit semantics, and integrity warning severity with contracts.

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
└── tasks.md                 # Phase 2 (/speckit-tasks) — paths need refresh for domain package
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
│       └── snapshot.yml
├── .fallowrc.json               # workspaces: packages/domain, packages/cli
├── AGENTS.md
├── eslint.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── scripts/
│   └── clean.mjs
├── tsconfig.base.json
├── tsconfig.json                # references packages/domain, packages/cli
├── tsconfig.build.json
├── vitest.config.ts
└── packages/
    ├── domain/
    │   ├── package.json         # @specable/domain
    │   ├── tsconfig.json
    │   ├── tsconfig.src.json
    │   ├── tsconfig.test.json
    │   ├── tsconfig.build.json
    │   ├── src/
    │   │   ├── index.ts         # generated exports
    │   │   ├── unions/          # Status, ActorCategory, ConceptRole, etc. (Schema.Literal unions)
    │   │   ├── Reference.ts
    │   │   ├── PrimitiveBase.ts
    │   │   ├── primitives/      # nine primitive type schemas
    │   │   └── errors.ts        # FixtureDecodeError (domain decode boundary)
    │   └── test/
    │       └── schema-decode.test.ts   # minimal: complex encode/decode only
    └── cli/
        ├── package.json         # @specable/cli; depends on @specable/domain
        ├── tsconfig.json
        ├── tsconfig.src.json
        ├── tsconfig.test.json
        ├── tsconfig.build.json
        ├── src/
        │   ├── bin.ts
        │   ├── index.ts
        │   ├── cli/
        │   │   └── CheckCommand.ts
        │   ├── graph/           # ProductGraph, GraphRepository, GraphLoader (internal), JSON decode
        │   ├── validation/      # Status-aware rules (consumes domain schemas)
        │   ├── integrity/
        │   ├── summary/
        │   ├── story/
        │   └── services/        # Layer composition (GraphRepositoryLive, FileSystemLive)
        ├── test/                # comprehensive @effect/vitest suites
        └── examples/
            ├── generic/{valid,invalid}/
            └── coachbridge-synthetic/{valid,invalid}/
```

**Structure Decision**: Phase 2 introduces `@specable/domain` as a dedicated workspace package per FR-056–FR-059. The domain package contains **only** Effect Schema definitions (primitive types, Schema literal unions for closed sets, references, annotations) and domain decode errors. Executable logic beyond Schema (graph indexing, status-aware validation, integrity, summaries, I/O) lives in `@specable/cli`. Native TypeScript `enum` is prohibited; use `Schema.Literal` unions (FR-057).

### Package dependency graph

```text
@specable/domain  (no dependency on @specable/cli)
       ↑
@specable/cli     (depends on @specable/domain; JSON/Node platform at boundary)
```

### Root scripts (template-equivalent)

| Script | Command |
|--------|---------|
| `pnpm codegen` | `pnpm -r --filter @specable/domain --filter @specable/cli run codegen` (domain first) |
| `pnpm check` | `tsc -b tsconfig.json` |
| `pnpm typecheck` | alias → `pnpm check` |
| `pnpm lint` | eslint flat config over `**/{src,test,examples,scripts}/**/*.{ts,mjs}` |
| `pnpm lint-fix` | `pnpm lint --fix` |
| `pnpm test` | vitest root config |
| `pnpm coverage` | vitest --coverage |
| `pnpm build` | `tsc -b tsconfig.build.json && pnpm -r --filter @specable/domain --filter @specable/cli run build` |
| `pnpm clean` | `node scripts/clean.mjs` |

### TypeScript configs

- Root `tsconfig.base.json`: strict settings + `@effect/language-service` plugin + path aliases:
  - `@specable/domain` → `packages/domain/src/index.ts`
  - `@specable/cli` → `packages/cli/src/index.ts`
- Root `tsconfig.json`: project references → **`packages/domain`**, **`packages/cli`** (cli references domain)
- Root `tsconfig.build.json`: build graph for both publishable packages
- Per-package: `tsconfig.src.json`, `tsconfig.test.json`, `tsconfig.build.json`

### Schema conventions (`@specable/domain`)

- **Closed-set values**: `Schema.Literal("Draft", "Active", "Deprecated")` style unions exported as named schemas and inferred types — never `enum`.
- **Annotations**: Use Effect Schema built-in annotations (`title`, `description`, `documentation`, `examples`, `identifier`, filters/refinements) to encode semantic meaning and field-level validation supported by Schema. Do **not** add custom `jsonSchema`/metadata objects unless a consuming tool exists and the metadata is tested.
- **Relationships**: Model canonical primitive relationships as primitive fields (`Capability.actors`, `Story.expectedResult`, etc.) with field-level annotations. Do **not** introduce a parallel `Graph*`/edge metadata model inside `@specable/domain`; physical link representation belongs to storage adapters.
- **Branded types**: Use `Schema.brand` for opaque values that are semantically distinct despite sharing a representation, especially canonical primitive IDs (`PrimitiveId`). Do not brand human prose/labels such as names, descriptions, notes, evidence, story text, or tags. Adapter-specific IDs (for example Notion page IDs, SQL row IDs, Confluence page IDs) must be separate adapter-layer brands, not aliases of `PrimitiveId`.
- **Logic boundary**: Cross-primitive graph rules, status-aware severity, integrity heuristics, and artifact generation are **not** in `@specable/domain`; they consume decoded domain types in `@specable/cli`.

### TypeScript and service conventions (`@specable/cli`)

Aligned with constitution v1.1.0 (Session 2026-06-25 PR review):

- **No `any`**: Use generics, Schema-inferred types, branded IDs, or `unknown` with narrowing. Registries (for example per-type fixture files) SHOULD use generic factory helpers with closed-over decode functions—not widened `Schema<any>` plus casts.
- **Avoid type casts**: Prefer typed helpers (`fixtureFile<A, I>()`, generic `loadFixtureFile`, Schema decode) so compile-time types flow without `as`. Document and test any unavoidable cast at an external boundary.
- **No `null`**: Use `Option` for optional values (for example missing `graph.json` metadata), `Effect.fail` for expected errors, not `null` returns.
- **Hide implementation behind abstractions**: Downstream modules (validation, integrity, summary, CLI commands) depend on **`GraphRepository`** (load contract returning `ProductGraph`), not on **`GraphLoader`** or filesystem details. File-backed JSON loading and Node `FileSystem` wiring live in `services/Layers.ts` as composition roots only.
- **Layer exports**: Publish `GraphRepositoryLive` / `GraphServicesLive` to consumers; keep loader and platform layers internal to composition unless a test or adapter explicitly needs them.
- **Effect error channels**: Expected failures use tagged `Schema.TaggedError` values and `Effect.fail`. Defects (`Effect.die`) are for unexpected bugs only. Domain, validation, integrity, summary, and command modules MUST NOT call `process.exit` or write directly to `console`.
- **CLI exit mapping at the boundary**: Map tagged errors and platform failures to FR-060 exit codes (`0` / `1` / `2`) only in `src/bin.ts` or `src/cli/CliExit.ts`. Commands return `Effect` failures; the boundary renders stderr and terminates the process. See [research.md](./research.md) R20 and [Effect error management](https://effect.website/docs/error-management/).

## Phase 0 — Research

Completed in [research.md](./research.md). Updated 2026-06-24 for two-package layout, Schema union conventions, JSON-only fixtures, exit codes, and duplicate-name warning severity. No remaining `NEEDS CLARIFICATION`.

Key decisions: `@specable/domain` + `@specable/cli`, Effect Schema literal unions (no TS `enum`), annotation-first field validation, **JSON-only** graph fixtures, `@effect/cli check`, stdout + `--out`, exit codes FR-060, Changesets for both packages, Fallow scoped to `packages/domain` and `packages/cli`.

## Phase 1 — Design & Contracts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| CLI contract | [contracts/cli-commands.md](./contracts/cli-commands.md) |
| Fixture contract | [contracts/fixture-format.md](./contracts/fixture-format.md) |
| Output contract | [contracts/output-artifacts.md](./contracts/output-artifacts.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Implementation sequencing (for `/speckit-tasks`)

1. **Repo bootstrap** — template scripts, TS configs, ESLint, CI, AGENTS.md, Changesets, Fallow config (Phase 1 largely complete; extend for `packages/domain`).
2. **`@specable/domain` package** — workspace scaffolding, Schema literal unions, primitive schemas with annotations, references, `FixtureDecodeError`, codegen exports, minimal decode tests.
3. **Graph loader (`@specable/cli`)** — JSON per-type files → `ProductGraph` via `GraphRepository` (public) and `GraphLoader` (file-backed implementation); Layer wiring in `services/`.
4. **Validation engine** — status-aware required field + relationship rules (FR-010–FR-026); consumes domain types.
5. **Integrity engine** — duplicate names (warnings), likely duplicates, triples, advisories, workflow derivations.
6. **Story + summary** — template text, Markdown sections, preview truncation.
7. **CLI** — `specable check` wiring, stdout/`--out` writers, exit codes (FR-060).
8. **Examples + tests** — generic + coachbridge synthetic; SC-003 engineered fixtures in `@specable/cli`.

### Test categories (constitution-mandated)

| Category | Package |
|----------|---------|
| Schema decode per primitive (complex compositions) | `@specable/domain` (minimal) |
| Schema decode per primitive file (fixture integration) | `@specable/cli` |
| Graph traversal / index lookups | `@specable/cli` |
| Missing-link + orphan detection with severity | `@specable/cli` |
| Duplicate names + likely duplicates + story triples | `@specable/cli` |
| Summary determinism + gap sections | `@specable/cli` |
| Loader behavior for missing type files | `@specable/cli` |
| CLI exit codes and `--out` artifacts | `@specable/cli` |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| IV. MCP-first: CLI only in v0 | Spec explicitly defers MCP; CLI proves validate/summary slice first | Building MCP server before CLI completes vertical slice without user-visible CLI demo |
| Snapshot workflow included but non-blocking | Template parity for future pkg.pr.new previews | Omitting workflow entirely would require re-adding CI later; template skip-on-missing-app pattern is low cost |
| Two packages vs one | FR-056 mandates `@specable/domain`; aligns with library-first and reuse for future MCP adapter | Keeping all schemas inside CLI couples domain model to CLI release cycle and blocks clean agent/library consumption |

## Repository boilerplate checklist (implementation)

- [x] Root `package.json` + `pnpm-workspace.yaml` (`packages/*`)
- [x] TS configs (root + `packages/cli/*`)
- [ ] TS configs for `packages/domain/*` + root references updated
- [x] `eslint.config.mjs` with `@effect/eslint-plugin`
- [x] `vitest.config.ts` + `@effect/vitest` setup
- [x] `scripts/clean.mjs`
- [ ] `.fallowrc.json` (workspaces → `packages/domain`, `packages/cli`)
- [x] `.changeset/config.json` (`PathableAI-org/SpecAble`)
- [x] `.github/actions/setup` + workflows (`check`, `fallow-audit`, `release`, `snapshot`)
- [ ] `AGENTS.md` updated for two-package layout (`@specable/domain` + `@specable/cli`)
- [x] `README.md` sections: commands, package layout, Effect guidance, publishing, template adaptation

## Phase 2

Task breakdown in [tasks.md](./tasks.md) — **requires refresh** via `/speckit-tasks` to relocate Phase 2 domain tasks from `packages/cli/src/domain/` to `packages/domain/src/` and replace enum tasks with Schema literal union tasks.
