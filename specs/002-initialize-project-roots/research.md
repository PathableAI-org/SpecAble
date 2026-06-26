# Research: Initialize JSON and SQLite Project Roots

**Feature**: `002-initialize-project-roots`  
**Date**: 2026-06-26

## R1 — Project root marker and configuration file

**Decision**: Introduce `specable.json` at the project root as the authoritative SpecAble project manifest. A directory is an initialized root if and only if `specable.json` exists and decodes successfully.

**Rationale**: v0 uses optional `graph.json` for display metadata only; alpha requires an explicit storage binding, stable `projectId`, and backend type. Separating `specable.json` (project/system config) from `graph.json` (optional human metadata) keeps v0 fixture directories valid for `specable check` without implying they are alpha project roots.

**Alternatives considered**:
- Extend `graph.json` with storage fields — rejected; breaks v0 fixture semantics and conflates graph metadata with project binding.
- Hidden dotfile (`.specable/config.json`) — rejected; less discoverable for reviewers and docs.
- Path-only identity (no persisted ID) — rejected; FR-017 requires stable identity for future MCP root selection.

## R2 — Project identity and naming

**Decision**: On init, generate a random UUID v4 `projectId`. Default `name` to the basename of the target path; allow optional `--name` CLI flag to override. `projectId` is immutable; `name` is user-facing and may be edited in a later milestone.

**Rationale**: UUID satisfies stable MCP root identity without coupling to filesystem layout. Basename default matches common CLI project scaffolding (e.g., `npm init` folder name).

**Alternatives considered**:
- Slug derived from path only — rejected; renaming directory would break identity.
- User must always pass `--name` — rejected; demo flow uses path-only init.

## R3 — JSON storage on-disk layout

**Decision**: JSON backend `storage.location` is `"."` (project root). Init creates nine empty per-type JSON files using v0 canonical filenames (`objectives.json`, `actors.json`, …) each containing `{ "primitives": [] }`. Optionally create `graph.json` with `schemaVersion: 1` and project `name` for human parity with v0 examples.

**Rationale**: Reuses [fixture-format.md](../001-product-primitives-v0/contracts/fixture-format.md) filenames so `GraphLoader` can load alpha JSON roots in a later milestone without layout translation. Empty arrays satisfy FR-007 empty-graph contract.

**Alternatives considered**:
- `graph/` subdirectory for all primitive files — rejected for this slice; adds GraphLoader path resolution work without user benefit at init-only milestone.
- Single combined `graph.json` for all primitives — rejected; diverges from v0 contract and complicates per-type CRUD in milestone 2.

## R4 — SQLite storage on-disk layout

**Decision**: SQLite backend `storage.location` is `"graph.sqlite"` relative to project root. Init creates the database with schema version table plus `primitives` table: `(id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT NOT NULL)` storing JSON-encoded primitive documents. No rows inserted at init.

**Rationale**: Document-shaped `payload` column keeps alpha CRUD simple and aligns semantic contract with JSON file entries without premature relational normalization. Single file matches demo expectation (`graph.sqlite` in project root).

**Alternatives considered**:
- Normalized per-type tables — rejected; premature for init-only slice; higher migration cost before CRUD design.
- In-memory SQLite — rejected; milestone requires persisted local database file.
- `better-sqlite3` direct API without Effect SQL — rejected; prefer Effect SQL integration for consistency with service/Layer model (R5).

## R5 — SQLite library and Effect integration

**Decision**: Use `@effect/sql` with `@effect/sql-sqlite-node` (Node native SQLite driver) composed in a `SqliteStorageBackend` Effect service. Wrap connection acquisition in scoped `Effect.acquireRelease` for tests.

**Rationale**: Constitution prefers Effect for services and errors. Effect SQL provides typed query interface and integrates with Layer composition in `services/Layers.ts`.

**Alternatives considered**:
- `better-sqlite3` with manual Effect wrapper — acceptable fallback if Effect SQL sqlite driver blocks CI; document in tasks as contingency.
- `sql.js` (WASM) — rejected; slower and awkward for CLI file persistence.

## R6 — Storage abstraction shape

**Decision**: Define `StorageBackend` Effect service with `bootstrap(projectRoot, config): Effect<void, StorageBootstrapError>` and `describe(projectRoot, config): Effect<GraphStoreSummary, StorageError>`. `ProjectRootService` orchestrates config read/write, delegates bootstrap to the backend selected by `storage.type`, and builds `ProjectDescriptor` for inspect.

**Rationale**: Satisfies FR-016 pluggable abstraction. Keeps CLI commands on `ProjectRootService` only. `GraphStoreSummary` reports primitive counts per type and `totalPrimitives` for empty-state verification.

**Alternatives considered**:
- Extend `GraphRepository` with init — rejected; load contract differs from bootstrap; mixing concerns violates single responsibility.
- Single god-service for all persistence — rejected; harder to test backends independently.

## R7 — Initialization command behavior

**Decision**: `specable init <path> --storage json|sqlite` with optional `--name`. Target path MUST NOT exist as an initialized root (`specable.json` present). If path does not exist, create directory tree. If path exists and is non-empty without `specable.json`, fail with `ProjectPathNotEmptyError`. Write `specable.json` last after storage bootstrap succeeds.

**Rationale**: Spec edge cases require no partial ambiguous state; config-last ordering lets inspect detect incomplete init if interrupted before manifest write.

**Alternatives considered**:
- Allow init into non-empty directory — rejected by spec edge case.
- Atomic directory rename from temp — deferred; config-last sufficient for alpha.

## R8 — Inspect command output

**Decision**: `specable project show <path>` prints human-readable fixed-field stdout (labeled lines) derived from `ProjectDescriptor` Schema. Stable field order: `projectId`, `name`, `storage.type`, `storage.location`, `schemaVersion`, `primitiveTypes`, `graph.totalPrimitives`, `graph.empty`. Exit `0` on success, `2` on usage/decode/not-found errors.

**Rationale**: Human demo per milestone; Schema-defined DTO enables future `--format json` without redesign. Exit `2` aligns with v0 check runtime error convention.

**Alternatives considered**:
- JSON-only output — rejected for primary UX; humans review demo.
- Default JSON — rejected; milestone demo shows readable inspect output.

## R9 — Primitive type and schema version reference

**Decision**: `specable.json` includes `schemaVersion: 1` (aligns with v0 `graph-schema: 1`) and `primitiveTypes` array listing all nine v0 canonical types in stable alphabetical order. Both backends initialize with zero instances of each type.

**Rationale**: FR-007 parity requires identical semantic contract. Explicit list supports inspect and future MCP schema resource without scanning storage.

**Alternatives considered**:
- Implicit types from empty files only — rejected; SQLite backend would not have per-type files to infer from.
- Bump schema version to 2 — rejected; ontology unchanged; storage binding is project-layer concern.

## R10 — Relationship to v0 `specable check`

**Decision**: This milestone does NOT change `specable check` behavior. v0 fixture directories (no `specable.json`) remain checkable as today. Alpha JSON roots will become checkable when `GraphRepository` gains storage-aware resolution (likely milestone 2 after CRUD or explicit loader adapter task).

**Rationale**: Vertical slice scope is init + inspect only. Avoids coupling check regression to storage abstraction before CRUD proves load path.

**Alternatives considered**:
- Immediately teach `check` to require `specable.json` — rejected; breaks v0 examples and bundled fixtures.

## R11 — Error taxonomy

**Decision**: Tagged errors via Effect Schema: `ProjectAlreadyInitializedError`, `ProjectPathNotEmptyError`, `UnsupportedStorageTypeError`, `ProjectNotFoundError`, `ProjectConfigDecodeError`, `IncompleteProjectError`, `StorageBootstrapError`. CLI maps each to exit `2` with actionable message.

**Rationale**: Constitution VI; mirrors v0 `GraphProjectNotFoundError` patterns in `packages/cli/src/errors.ts`.

**Alternatives considered**:
- Generic `Error` strings — rejected; untestable and unstable for agents.

## R12 — MCP root identity (forward-looking)

**Decision**: Future MCP root URIs will reference `projectId` from `specable.json`, not raw filesystem paths. `project show` displays path as `rootPath` (operational) separate from `projectId` (canonical).

**Rationale**: FR-017; paths may differ per machine; UUID is portable in agent contracts.

**Alternatives considered**:
- Filesystem path as MCP root ID — rejected by spec constraint.
