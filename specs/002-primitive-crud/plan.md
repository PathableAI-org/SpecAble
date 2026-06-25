# Implementation Plan: Primitive CRUD for Local Graph Projects

**Branch**: `002-primitive-crud` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-primitive-crud/spec.md` — basic CRUD on local JSON primitives before human-facing summary generation in `001`.

## Summary

Add **local primitive authoring** to `@specable/cli`: a `PrimitiveStore` repository service (create, get, list, update, delete) backed by the existing per-type JSON fixture layout, plus CLI commands `specable init` and `specable primitive {create,get,list,update,delete}`. Writes decode/encode through `@specable/domain` schemas, persist atomically with deterministic JSON formatting, and integrate with existing `GraphRepository.load` without cache layers.

This slice intentionally precedes `001` User Story 3 (summary generation): users must be able to populate and maintain graph fixtures before summaries communicate product state.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022; Node.js 20+ (CI pins 24.x)

**Primary Dependencies**: Existing `effect@^3.21`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`; reuses `@specable/domain` primitive schemas and `001` graph types (`ProductGraph`, `FixtureFiles`, `GraphLoader`)

**Storage**: Local JSON graph project directories (same layout as `001`); atomic file writes via temp file + rename

**Testing**: `@effect/vitest`; test Layers with in-memory/temp-dir FileSystem; cover all tagged errors, round-trips, atomic write failure simulation, and loader integration after mutations

**Target Platform**: Node.js local CLI; fully offline

**Project Type**: Extends existing pnpm monorepo (`@specable/domain` + `@specable/cli`); no new packages

**Performance Goals**: CRUD on 50-primitive graph completes in <2s (SC-106)

**Constraints**: No `any`; avoid type casts; storage I/O only in `GraphLoader` / new `PrimitiveStore` implementation composed in `services/Layers.ts`; schema decode at write boundary; deterministic on-disk JSON

**Scale/Scope**: Single-writer local authoring; nine primitive types; five CLI subcommands + `init`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ |
| II. Adapter-based | Is core logic free of Notion/Jira/Linear/GitHub/Figma/etc. dependencies? Are integrations adapter-only? | ✅ Local JSON only |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ |
| IV. MCP-first | If agent-facing, are read/query/validation/generation prioritized over write-back automation? | ⚠️ See Complexity Tracking — minimal **local** writes only |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ `PrimitiveStore` in cli library |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ CRUD returns typed records; optional `--check` surfaces validation gaps |
| VIII. Vertical slice | Does this slice produce a demoable outcome (validate, summarize, query, detect gaps)? | ✅ Author graph → `specable check` succeeds |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ JSON stdout + init scaffolding; enables `001` summaries |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform, or vendor replacement ambitions? | ✅ |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ |

**Post-design re-check (2026-06-24)**: All gates pass with documented Principle IV exception for local fixture authoring.

## Project Structure

### Documentation (this feature)

```text
specs/002-primitive-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── cli-commands.md
│   └── write-operations.md
└── tasks.md                 # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
packages/cli/src/
├── graph/
│   ├── GraphRepository.ts      # extend or sibling — load unchanged public contract
│   ├── GraphLoader.ts            # add internal write helpers OR separate GraphWriter
│   ├── PrimitiveStore.ts         # NEW — public CRUD service
│   ├── FixtureFiles.ts           # reuse type → filename routing
│   ├── JsonEncode.ts             # NEW — deterministic JSON encode
│   └── ProductGraph.ts
├── cli/
│   ├── InitCommand.ts            # NEW
│   └── primitive/                # NEW
│       ├── CreateCommand.ts
│       ├── GetCommand.ts
│       ├── ListCommand.ts
│       ├── UpdateCommand.ts
│       └── DeleteCommand.ts
├── errors.ts                     # add PrimitiveNotFoundError if not present
└── services/
    └── Layers.ts                 # compose PrimitiveStoreLive

packages/cli/test/
├── graph/primitive-store.test.ts # NEW — CRUD + round-trip
├── cli/init-command.test.ts      # NEW
└── cli/primitive-commands.test.ts # NEW
```

**Structure Decision**: Extend `@specable/cli` only. `@specable/domain` unchanged (schemas already exist). Introduce `PrimitiveStore` as the consumer-facing write/read-by-id contract; keep file path logic and JSON serialization inside graph layer implementation modules composed via Layers — not in CLI command files.

### TypeScript and service conventions

Per constitution v1.1.0 and `001` plan:

- **No `any`**: Generic primitive decode via existing `FixtureFiles` registry and closed-over schemas.
- **Avoid type casts**: Use Schema encode/decode for persistence boundary.
- **Hide storage I/O**: `PrimitiveStore` public API; `GraphLoader` or dedicated `GraphWriter` module handles filesystem paths and atomic writes.
- **No `null`**: `Option` for optional fields; tagged errors for not-found/duplicate.

## Phase 0 — Research

Completed in [research.md](./research.md). No remaining `NEEDS CLARIFICATION`.

## Phase 1 — Design & Contracts

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| CLI contract | [contracts/cli-commands.md](./contracts/cli-commands.md) |
| Write contract | [contracts/write-operations.md](./contracts/write-operations.md) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Implementation sequencing (for `/speckit-tasks`)

1. **Errors + JSON encode** — `PrimitiveNotFoundError`, deterministic `JsonEncode.ts`
2. **GraphWriter internals** — read/modify/write per-type files, atomic persist, global ID index check
3. **PrimitiveStore service** — create/get/list/update/delete; Layer in `services/Layers.ts`
4. **Init command** — scaffold project directory
5. **Primitive CLI commands** — thin `@effect/cli` adapters
6. **Integration tests** — round-trip per type, loader sees mutations, quickstart scenarios
7. **Wire `bin.ts`** — register `init` and `primitive` command group

### Test categories

| Category | Package |
|----------|---------|
| Schema decode on write (invalid payload) | `@specable/cli` |
| Create/get/list/update/delete happy paths | `@specable/cli` |
| Duplicate ID + not-found error paths | `@specable/cli` |
| Atomic write failure (simulated) | `@specable/cli` |
| `GraphRepository.load` after mutation | `@specable/cli` |
| Init scaffold + force guard | `@specable/cli` |
| CLI exit codes and stdout JSON | `@specable/cli` |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| IV. MCP-first: local write commands before MCP | Users must author fixtures locally before summaries; read-only CLI cannot demonstrate end-to-end product modeling | Manual JSON editing is error-prone, bypasses schema decode, and blocks the stated goal of enabling summary generation |
| Separate `PrimitiveStore` vs extending `GraphRepository` | Single responsibility: load whole graph vs mutate single primitive; avoids bloating load contract | Adding CRUD methods directly to `GraphRepository` couples read-all and write-one concerns and encourages feature modules to depend on write APIs when they only need load |

## Phase 2

Task breakdown via `/speckit-tasks` — not created by this command.
