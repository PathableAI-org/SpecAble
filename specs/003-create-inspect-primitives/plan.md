# Implementation Plan: Create and Inspect Primitives

**Branch**: `003-create-inspect-primitives` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-create-inspect-primitives/spec.md`

## Summary

Deliver the second alpha vertical slice: CLI commands to **create**, **list**, and **get** product primitives within an initialized SpecAble project root. Primitives persist through the existing **`StorageBackend`** abstraction (JSON files or SQLite) with semantic parity at the read boundary.

Technical approach: extend **`@specable/core`** with `PrimitiveService` (orchestrates manifest validation, Schema decode, ID assignment, storage delegation) and extend **`StorageBackend`** with `create`, `list`, and `get` methods. Update `describe` to support non-empty graphs so `project show` remains valid after creates. Add **`specable primitive create|list|get`** thin CLI adapters in **`@specable/cli`**, following the `InitCommand` / `ProjectShowCommand` pattern. Domain schemas in **`@specable/domain`** remain unchanged; decode at storage and service boundaries. v0 `specable check` and `GraphRepository` stay in CLI unchanged.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022; Node.js 20+ (CI pins 24.x)

**Primary Dependencies**: `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@effect/sql`, `@effect/sql-sqlite-node`, `@specable/domain`, `@specable/core`, `@specable/cli`

**Storage**: Extend existing JSON per-type file layout (`{ "primitives": [...] }`) and SQLite `primitives(id, type, payload)` table from milestone 002; authoritative manifest `specable.json` unchanged

**Testing**: Vitest 4 + `@effect/vitest`; storage round-trip and `PrimitiveService` contract tests in `packages/core/test/`; CLI wiring, flag parsing, and output tests in `packages/cli/test/`

**Target Platform**: Node.js local CLI; Linux/macOS/WSL; fully offline; library API reusable by future MCP tools

**Project Type**: pnpm monorepo — `@specable/domain` + `@specable/core` (primitive CRUD + storage) + `@specable/cli` (CLI surface + v0 check)

**Performance Goals**: Create + list + get for a single primitive completes in <2s on typical laptop; supports SC-001 ten-minute demo budget for two types × two backends

**Constraints**: Local-first only; no network; strict TS; no `any`; storage I/O behind Effect services/Layers in core; eight alpha primitive types at create boundary (CapabilityConceptLink deferred); Draft-status minimum fields only; importing `@specable/core` must not execute CLI

**Scale/Scope**: Single root per command; two storage backends; create/list/get only (no update/delete/relationships); synthetic demo data; automated storage-boundary tests without CLI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ Primitives persist as structured graph records in JSON/SQLite storage; no side stores |
| II. Adapter-based | Is core logic free of hosted service dependencies? Are integrations adapter-only? | ✅ JSON and SQLite remain local adapters behind extended `StorageBackend` |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query prioritized over write-back automation? | ✅ Library-first create/list/get in core prepares MCP delegation; MCP surface deferred |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ `PrimitiveService` + storage in core; CLI thin adapters only |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ Domain `Primitive` schemas at boundaries; tagged errors; `PrimitiveSummary` / read projection DTOs in core |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ Get returns persisted fields only; validation errors report field paths |
| VIII. Vertical slice | Does this slice produce a demoable outcome? | ✅ Demo: create, list, get on JSON + SQLite roots |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ CLI stdout formatters; quickstart and contracts document validation flows |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform ambitions? | ✅ CRUD subset only; no relationships, graph validation, or MCP |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ Core storage tests + CLI surface tests per FR-020 / SC-006 |
| Effect Requirements | Are service tags, Live Layer paths, composition root, and public method `R` documented? | ✅ See Service & Layer map below |

**Post-design re-check (2026-06-27)**: All gates pass. `StorageBackend` extended in place (not parallel store). `describe` updated for populated graphs. ID assignment uses type-prefix + slug + short suffix (see [research.md](./research.md) R1). Eight alpha types supported at create; CapabilityConceptLink deferred to relationship milestone.

## Project Structure

### Documentation (this feature)

```text
specs/003-create-inspect-primitives/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   ├── cli-commands.md
│   ├── primitive-operations.md
│   └── storage-crud.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
SpecAble/
├── packages/
│   ├── domain/                         # @specable/domain (unchanged schemas)
│   ├── core/                           # @specable/core (EXTEND)
│   │   ├── src/
│   │   │   ├── project/                # unchanged init/inspect
│   │   │   ├── storage/
│   │   │   │   ├── StorageBackend.ts       # extend contract: create, list, get
│   │   │   │   ├── JsonStorageBackend.ts   # append/read primitives in type files
│   │   │   │   ├── SqliteStorageBackend.ts   # INSERT/SELECT primitives
│   │   │   │   ├── RoutedStorageBackend.ts   # route new methods
│   │   │   │   ├── PrimitiveSchemas.ts       # NEW: type → Schema registry (from FixtureFiles pattern)
│   │   │   │   ├── layers.ts
│   │   │   │   └── PrimitiveTypes.ts
│   │   │   ├── primitive/                # NEW
│   │   │   │   ├── PrimitiveService.ts
│   │   │   │   ├── PrimitiveSummary.ts   # list DTO
│   │   │   │   ├── CreateInput.ts
│   │   │   │   └── errors.ts
│   │   │   └── index.ts                    # generated exports
│   │   └── test/
│   │       ├── storage/                    # NEW: create/list/get round-trip per backend
│   │       └── primitive/                    # NEW: service contract suites
│   └── cli/                            # @specable/cli (EXTEND)
│       ├── src/
│       │   ├── bin.ts                      # register primitive error handlers
│       │   ├── cli/
│       │   │   ├── RootCommand.ts          # add primitive subcommand group
│       │   │   ├── PrimitiveCreateCommand.ts
│       │   │   ├── PrimitiveListCommand.ts
│       │   │   ├── PrimitiveGetCommand.ts
│       │   │   └── render/PrimitiveOutput.ts
│       │   ├── graph/                      # v0 loader (unchanged)
│       │   └── services/
│       │       └── Layers.ts               # PrimitiveServiceLive + RoutedStorageBackendLive
│       └── test/
│           └── cli/                        # primitive command wiring + output
```

**Structure Decision**: Extend `@specable/core` with `primitive/` module and storage CRUD methods rather than adding a new package. Consolidate type→schema mapping into core (`PrimitiveSchemas.ts`) to avoid drift with CLI `FixtureFiles.ts` (CLI may re-export or delegate to core in a later refactor; v0 check keeps local `FixtureFiles.ts` unchanged per FR-018a pattern). CLI adds `primitive` command group mirroring existing alpha command adapters.

### TypeScript and service conventions

Per `.specify/memory/constitution.md` v1.3.0 and
[`.specify/memory/effect-service-patterns.md`](../../.specify/memory/effect-service-patterns.md):

- **No `any`**: Schema-inferred `Primitive`, `PrimitiveSummary`, and tagged errors in core.
- **Avoid type casts**: Decode via `Schema.decodeUnknown` at storage and service boundaries (`SchemaDecode.ts` pattern).
- **Hide storage I/O**: CLI commands depend on `PrimitiveService` only; JSON/SQLite mechanics stay in `storage/`.
- **Import safety**: `@specable/core` exports library modules only; no runtime side effects on import.
- **Requirements (`R`)**: Public service methods use `R = never` when platform deps are absorbed at Layer build.

### Service & Layer map

| Item | Detail |
|------|--------|
| Tags introduced | `@specable/core/PrimitiveService` (new); `@specable/core/StorageBackend` (extended contract, same tag) |
| Live Layer modules | `packages/core/src/primitive/PrimitiveService.ts` → `PrimitiveService.Default` (depends on `StorageBackend`, `FileSystem` absorbed at Layer build); `packages/core/src/storage/layers.ts` → `JsonStorageBackendLive`, `SqliteStorageBackendLive`, `RoutedStorageBackendLive` (unchanged export paths) |
| Composition root | `packages/cli/src/services/Layers.ts` → `primitiveServiceLiveLayer` using `RoutedStorageBackendLive` + `NodeFileSystem.layer`; `packages/cli/src/bin.ts` → provide merged `MainLayer` |
| Public method `R` | `PrimitiveService.create` / `list` / `get` → `never`; extended `StorageBackend.create` / `list` / `get` / `describe` → `never`; platform tags resolved in Layer construction |
| Local references | `packages/core/src/storage/StorageBackend.ts`, `ProjectRootService.ts`, `packages/cli/src/cli/InitCommand.ts`, `ProjectShowCommand.ts`, `services/Layers.ts`, `bin.ts`, `packages/cli/src/graph/GraphLoader.ts` (decode pattern only) |

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
