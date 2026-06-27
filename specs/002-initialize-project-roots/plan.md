# Implementation Plan: Initialize JSON and SQLite Project Roots

**Branch**: `002-initialize-project-roots` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-initialize-project-roots/spec.md`

## Summary

Deliver the first alpha vertical slice: CLI commands to **initialize** and **inspect** SpecAble **project roots** with a pluggable storage abstraction supporting **local JSON files** and **local SQLite**. A project root is a storage-bound context (stable `projectId`, storage adapter binding, graph namespace, ontology reference)—not merely a directory of fixtures.

Technical approach: introduce **`@specable/core`** for project configuration schemas, `ProjectRootService`, `StorageBackend` contract, and JSON/SQLite Live Layer modules. **`@specable/cli`** remains a thin adapter: compose Layers at `bin.ts`, wire `init` and `project show` commands, render stdout. Persist authoritative configuration in `specable.json`. JSON backend reuses v0 per-type JSON filenames; SQLite backend creates `graph.sqlite` with zero primitives. CLI surface: `specable init <path> [--storage json|sqlite]` (defaults to `json`) and `specable project show <path>`. v0 `specable check` graph loading stays in `@specable/cli` unchanged.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022; Node.js 20+ (CI pins 24.x)

**Primary Dependencies**: `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@specable/domain` (primitive types); `@specable/core` (new); add `@effect/sql` + `@effect/sql-sqlite-node` for SQLite bootstrap (see [research.md](./research.md))

**Storage**: Local JSON files (v0-compatible per-type layout) and local SQLite (`graph.sqlite`); authoritative project manifest `specable.json`

**Testing**: Vitest 4 + `@effect/vitest`; contract and behavior tests in `packages/core/test/`; CLI wiring/output tests in `packages/cli/test/`

**Target Platform**: Node.js local CLI; Linux/macOS/WSL; fully offline; library API reusable by future MCP server

**Project Type**: pnpm monorepo — `@specable/domain` + `@specable/core` (project root, storage) + `@specable/cli` (CLI surface + v0 check)

**Performance Goals**: Init + inspect for empty roots completes in <2s on typical laptop (supports SC-001 five-minute demo budget)

**Constraints**: Local-first only; no network; strict TS; no `any`; storage I/O behind Effect services/Layers exported from core; v0 `specable check` on legacy fixture dirs remains unchanged; product primitives only; importing `@specable/core` must not execute CLI or acquire live resources

**Scale/Scope**: Single root per command; two storage backends; empty graph only (no CRUD); nine v0 primitive types; demo paths use synthetic names

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ Init creates empty typed graph namespace; no artifact-only stores |
| II. Adapter-based | Is core logic free of hosted service dependencies? Are integrations adapter-only? | ✅ JSON and SQLite are local adapters behind `StorageBackend` services in `@specable/core` |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query prioritized over write-back automation? | ✅ MCP deferred; `ProjectDescriptor` in core prepares stable inspect contract for future root discovery |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ `@specable/core` owns init/inspect; `@specable/cli` thin adapter only (FR-018) |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ `specable.json`, `ProjectDescriptor`, tagged init errors via Effect Schema in core |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ Inspect reports empty graph honestly; no invented primitives |
| VIII. Vertical slice | Does this slice produce a demoable outcome? | ✅ Demo: init JSON (default) + SQLite roots, inspect both |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ `project show` human-readable stdout; contracts document layouts |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform ambitions? | ✅ Init + inspect only; CRUD/MCP deferred |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ Core library tests + CLI surface tests (FR-019) |

**Post-design re-check (2026-06-26)**: All gates pass. `@specable/core` exports `StorageBackend` contract and per-backend Live Layers; `@specable/cli` composes Layers at `bin.ts` (platform/node pattern). `projectId` in `specable.json` is canonical identity; filesystem path is operational context only. v0 `GraphRepository` remains in CLI per FR-018a.

## Project Structure

### Documentation (this feature)

```text
specs/002-initialize-project-roots/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   ├── cli-commands.md
│   ├── project-config.md
│   └── storage-layouts.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
SpecAble/
├── packages/
│   ├── domain/                         # @specable/domain (unchanged primitive schemas)
│   ├── core/                           # @specable/core (NEW)
│   │   ├── src/
│   │   │   ├── project/
│   │   │   │   ├── ProjectConfig.ts        # specable.json Schema
│   │   │   │   ├── ProjectDescriptor.ts    # inspect DTO
│   │   │   │   ├── ProjectRootService.ts
│   │   │   │   └── errors.ts
│   │   │   ├── storage/
│   │   │   │   ├── StorageBackend.ts       # service contract
│   │   │   │   ├── JsonStorageBackend.ts
│   │   │   │   ├── SqliteStorageBackend.ts
│   │   │   │   ├── layers.ts               # JsonStorageBackendLive, SqliteStorageBackendLive
│   │   │   │   └── PrimitiveTypes.ts
│   │   │   └── index.ts                    # generated exports
│   │   └── test/
│   │       ├── project/                    # init + inspect contract suites
│   │       └── fixtures/project/
│   └── cli/                            # @specable/cli
│       ├── src/
│       │   ├── bin.ts                      # compose core + platform Layers; run CLI
│       │   ├── cli/
│       │   │   ├── RootCommand.ts          # add init + project subcommands
│       │   │   ├── InitCommand.ts          # thin: invoke ProjectRootService
│       │   │   ├── ProjectShowCommand.ts
│       │   │   └── render/ProjectShowOutput.ts
│       │   ├── graph/                      # v0 loader (unchanged this slice)
│       │   └── services/
│       │       └── Layers.ts               # GraphRepository + merge with core Layers
│       └── test/
│           └── cli/                        # wiring, --storage default, output format
```

**Structure Decision**: Add `@specable/core` workspace package for all init/inspect/storage logic (FR-018). `@specable/cli` depends on `@specable/core` and `@specable/domain`; CLI commands invoke core Effects only. Core exports service contracts and per-backend Live Layer modules; `bin.ts` composes the full stack with `@effect/platform-node` (FR-016). v0 `graph/` and `GraphRepository` stay in CLI (FR-018a). JSON init layout matches v0 `fixture-format.md` filenames. Root `package.json` scripts must add `@specable/core` to codegen/build filters.

### TypeScript and service conventions

Per `.specify/memory/constitution.md` v1.2.0+ and
[`.specify/memory/effect-service-patterns.md`](../../.specify/memory/effect-service-patterns.md):

- **No `any`**: Schema-inferred types for config and inspect DTOs in `@specable/core`.
- **Avoid type casts**: SQLite row decode via Schema at storage boundary in core.
- **Hide storage I/O**: CLI commands depend on `ProjectRootService` from core; JSON/SQLite Live Layers exported from `packages/core/src/storage/layers.ts`.
- **Import safety**: `@specable/core` exports library modules only; no runtime side effects on import.
- **Requirements (`R`)**: Public service methods use `R = never` when platform deps are absorbed at Layer build.

### Service & Layer map

| Item | Detail |
|------|--------|
| Tags introduced | `@specable/core/StorageBackend`, `@specable/core/ProjectRootService` |
| Live Layer modules | `packages/core/src/storage/layers.ts` → `JsonStorageBackendLive`, `SqliteStorageBackendLive` (each requires `FileSystem` parent when composing) |
| Composition root | `packages/cli/src/services/Layers.ts` and `packages/cli/src/bin.ts` (Phase 3) |
| Public method `R` | `StorageBackend.bootstrap` / `describe` → `never`; `ProjectRootService.initialize` / `describe` → `never` |
| Local references | `packages/cli/src/graph/GraphLoader.ts`, `GraphRepository.ts`, `services/Layers.ts`, `bin.ts` |

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `@specable/core` package | FR-018: shared library for CLI + future MCP | Keeping logic in CLI duplicates init/inspect when MCP ships |
| — | — | — |
