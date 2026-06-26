# Implementation Plan: Initialize JSON and SQLite Project Roots

**Branch**: `002-initialize-project-roots` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-initialize-project-roots/spec.md`

## Summary

Deliver the first alpha vertical slice: CLI commands to **initialize** and **inspect** SpecAble **project roots** with a pluggable storage abstraction supporting **local JSON files** and **local SQLite**. A project root is a storage-bound context (stable project identity, storage adapter binding, graph namespace, ontology reference)—not merely a directory of fixtures.

Technical approach: extend `@specable/cli` with a `project/` module (config schemas, init orchestration, inspect DTOs) and a `storage/` module (JSON and SQLite bootstrap behind Effect services). Persist authoritative configuration in `specable.json` at the project root. JSON backend reuses v0 per-type JSON filenames at the project root; SQLite backend creates `graph.sqlite` with a minimal schema holding zero primitives. CLI surface: `specable init <path> --storage json|sqlite` and `specable project show <path>`. Library logic and tests precede thin CLI adapters per constitution v1.1.0.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022; Node.js 20+ (CI pins 24.x)

**Primary Dependencies**: `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@specable/domain` (primitive types and Schema unions); add `@effect/sql` + `@effect/sql-sqlite-node` for SQLite bootstrap (see [research.md](./research.md))

**Storage**: Local JSON files (v0-compatible per-type layout) and local SQLite (`graph.sqlite`); authoritative project manifest `specable.json`

**Testing**: Vitest 4 + `@effect/vitest`; synthetic temp directories under `packages/cli/test/`; contract tests for config decode, init failures, storage parity, and inspect output

**Target Platform**: Node.js local CLI; Linux/macOS/WSL; fully offline

**Project Type**: pnpm monorepo — `@specable/domain` (schemas) + `@specable/cli` (project root, storage adapters, CLI)

**Performance Goals**: Init + inspect for empty roots completes in <2s on typical laptop (supports SC-001 five-minute demo budget)

**Constraints**: Local-first only; no network; strict TS; no `any`; storage I/O behind Effect services/Layers; v0 `specable check` on legacy fixture dirs remains unchanged; product primitives only

**Scale/Scope**: Single root per command; two storage backends; empty graph only (no CRUD); nine v0 primitive types; demo paths use synthetic names

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ Init creates empty typed graph namespace; no artifact-only stores |
| II. Adapter-based | Is core logic free of hosted service dependencies? Are integrations adapter-only? | ✅ JSON and SQLite are local adapters behind `StorageBackend` services |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query prioritized over write-back automation? | ✅ MCP deferred; `project show` DTO prepares stable inspect contract for future root discovery |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ `ProjectRootService` + storage backends in library; thin CLI commands |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ `specable.json`, inspect DTO, tagged init errors via Effect Schema |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ Inspect reports empty graph honestly; no invented primitives |
| VIII. Vertical slice | Does this slice produce a demoable outcome? | ✅ Demo: init JSON + SQLite roots, inspect both |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ `project show` human-readable stdout; contracts document layouts |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform ambitions? | ✅ Init + inspect only; CRUD/MCP deferred |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ |

**Post-design re-check (2026-06-26)**: All gates pass. Storage abstraction (`StorageBackend`, `ProjectRootService`) hides JSON/SQLite mechanics from CLI commands. `projectId` in `specable.json` is the stable identity for future MCP root URIs; filesystem path is operational context only.

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
│   ├── domain/                    # @specable/domain (unchanged primitive schemas)
│   └── cli/                       # @specable/cli
│       ├── src/
│       │   ├── bin.ts
│       │   ├── cli/
│       │   │   ├── RootCommand.ts       # add init + project subcommands
│       │   │   ├── InitCommand.ts
│       │   │   ├── ProjectShowCommand.ts
│       │   │   └── render/ProjectShowOutput.ts
│       │   ├── project/
│       │   │   ├── ProjectConfig.ts     # specable.json Schema
│       │   │   ├── ProjectDescriptor.ts # inspect DTO
│       │   │   ├── ProjectRootService.ts
│       │   │   └── errors.ts            # init/inspect tagged errors
│       │   ├── storage/
│       │   │   ├── StorageBackend.ts    # service contract
│       │   │   ├── JsonStorageBackend.ts
│       │   │   ├── SqliteStorageBackend.ts
│       │   │   └── PrimitiveTypes.ts    # canonical nine-type list
│       │   ├── graph/                   # existing v0 loader (unchanged this slice)
│       │   └── services/
│       │       └── Layers.ts            # compose ProjectRoot + storage Layers
│       └── test/
│           ├── project/                 # init + inspect suites
│           └── fixtures/project/        # synthetic init scenarios
```

**Structure Decision**: Extend `@specable/cli` only; no new workspace packages. Project root and storage adapter code live in dedicated `project/` and `storage/` modules. v0 `graph/` and `GraphRepository` remain for `specable check` on fixture directories; wiring `check` to alpha roots is a follow-up once CRUD lands (milestone 2). JSON init layout matches v0 `fixture-format.md` filenames so a future adapter can delegate to `GraphLoader` without path translation.

### TypeScript and service conventions

Per `.specify/memory/constitution.md` v1.1.0+:

- **No `any`**: Schema-inferred types for config and inspect DTOs.
- **Avoid type casts**: SQLite row decode via Schema at storage boundary.
- **Hide storage I/O**: CLI commands depend on `ProjectRootService`; JSON/SQLite file creation composed in `services/Layers.ts` only.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
