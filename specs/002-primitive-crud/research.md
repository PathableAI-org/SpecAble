# Research: Primitive CRUD for Local Graph Projects

**Feature**: `002-primitive-crud`  
**Date**: 2026-06-24

## R1 — Service boundary for CRUD

**Decision**: Introduce `PrimitiveStore` as a dedicated Effect service in `packages/cli/src/graph/PrimitiveStore.ts` with `create`, `get`, `list`, `update`, `delete`. Keep `GraphRepository.load` unchanged for whole-graph consumers (validation, integrity, summary).

**Rationale**: Constitution v1.1.0 requires repository-shaped contracts and hiding file I/O. Separating whole-graph load from single-primitive mutation avoids coupling validation modules to write APIs.

**Alternatives considered**:
- Extend `GraphRepository` with CRUD methods — rejected; violates single-purpose service boundary.
- Standalone `GraphWriter` without `PrimitiveStore` — rejected; CLI would depend on writer internals instead of a stable contract.

## R2 — File write implementation

**Decision**: Implement write path inside `packages/cli/src/graph/` as internal helpers used by `PrimitiveStore` (either extend `GraphLoader` with package-private write methods or add `GraphPersistence.ts`). Use `@effect/platform` FileSystem: read file → parse → mutate in memory → encode → write temp → rename.

**Rationale**: Reuses existing fixture routing (`FIXTURE_FILES`, `fixtureFile`). Atomic rename prevents corrupt JSON on crash.

**Alternatives considered**:
- Append-only JSONL per type — rejected; breaks `001` fixture contract.
- In-memory graph with full rewrite on every change — acceptable for v0 scale; matches per-type file model.

## R3 — JSON encoding determinism

**Decision**: Custom `JsonEncode.ts` with stable key ordering (recursive sort of object keys), 2-space indent, trailing newline. Encode from Schema-decoded domain values, not raw user input strings.

**Rationale**: SC-102 round-trip tests and diff-friendly repos. Re-encoding through Schema normalizes field order and strips unknown keys.

**Alternatives considered**:
- `JSON.stringify` without key sorting — rejected; non-deterministic ordering across runtimes/inputs.
- Store user bytes verbatim — rejected; bypasses schema normalization.

## R4 — ID uniqueness scope

**Decision**: Enforce **global** ID uniqueness across all primitive types on create/update, consistent with `001` `DuplicateIdError` and validation rules.

**Rationale**: `ProductGraph` indexes by `id` globally; duplicate IDs across types would break loader and validation.

**Alternatives considered**:
- Per-type uniqueness only — rejected; conflicts with `001` graph index model.

## R5 — Validation on write

**Decision**: **Schema decode only** at write boundary. Optional `--check` runs existing validation pipeline after mutation; default create/update/delete exit codes unaffected by validation warnings/failures.

**Rationale**: FR-101 clarification — Draft authoring must stay low-friction; full rules belong to `specable check`.

**Alternatives considered**:
- Full status-aware validation on every write — rejected; blocks incremental graph building.
- No validation ever — rejected; `--check` provides a useful authoring guardrail.

## R6 — CLI command shape

**Decision**: `specable init <dir>` plus nested group `specable primitive {create,get,list,update,delete}` using `@effect/cli` subcommands. Payload via `--file <path>` or stdin when TTY allows.

**Rationale**: Keeps `check` as primary read/analyze command; groups authoring commands under `primitive` namespace. Matches Effect CLI patterns from `001`.

**Alternatives considered**:
- Top-level `specable create` — rejected; namespace collision with future commands.
- REPL/interactive mode — out of scope.

## R7 — Init behavior

**Decision**: `specable init <dir>` creates directory if missing. Default: write `graph.json` with `schemaVersion: 1` and **no** per-type files (lazy creation on first `create`). `--scaffold-files` writes all nine empty `{ "primitives": [] }` files. `--force` overwrites only init-managed files when explicitly passed.

**Rationale**: Lazy files match `001` loader (missing file = empty). `--scaffold-files` helps users who want visible project structure.

**Alternatives considered**:
- Always create all nine files — acceptable optional flag; not default to reduce clutter.

## R8 — Delete empty file policy

**Decision**: After delete, if `primitives` is empty, **retain** the file as `{ "primitives": [] }`.

**Rationale**: Spec edge case preference; keeps filename set stable for editors and `--scaffold-files` layouts.

## R9 — Type change on update

**Decision**: Reject updates where payload `type` differs from stored record type (exit `2`). Users must delete + create to move across type files.

**Rationale**: Type determines storage file; cross-file move is a different operation (out of scope).

## R10 — Integration with existing loader

**Decision**: No in-process cache. After `PrimitiveStore` mutation, `GraphRepository.load` re-reads from disk.

**Rationale**: FR-121; simplest correct model for local CLI. Caching would require invalidation complexity unjustified at v0 scale.

## R11 — Error reuse

**Decision**: Reuse `DuplicateIdError` from `packages/cli/src/errors.ts` for ID collisions. Add `PrimitiveNotFoundError` for missing IDs on get/update/delete.

**Rationale**: Aligns tagged errors with `001`; avoids duplicate error types.

## R12 — Read list ordering

**Decision**: `list` returns primitives sorted by `id` ascending (lexicographic).

**Rationale**: Deterministic stdout for tests and scripting.
