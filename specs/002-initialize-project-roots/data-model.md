# Data Model: Initialize JSON and SQLite Project Roots

**Feature**: `002-initialize-project-roots`  
**Date**: 2026-06-26

## Package boundaries

| Concern | Package | Location |
|---------|---------|----------|
| Primitive type schemas | `@specable/domain` | `packages/domain/src/` (unchanged) |
| Project config, storage bootstrap, inspect | `@specable/cli` | `packages/cli/src/project/`, `packages/cli/src/storage/` |
| CLI commands | `@specable/cli` | `packages/cli/src/cli/` |

## Service boundaries (`@specable/cli`)

| Service | Role | Consumers |
|---------|------|-----------|
| `ProjectRootService` | `initialize`, `describe` (inspect) | `InitCommand`, `ProjectShowCommand` |
| `StorageBackend` (tagged by type) | Bootstrap empty store, summarize graph counts | `ProjectRootService` only |
| `FileSystem` | Platform I/O | Composed in `services/Layers.ts` |
| `GraphRepository` | v0 load contract (unchanged this slice) | `CheckCommand` |

Storage mechanics (JSON file creation, SQLite DDL, connection strings) MUST NOT leak past `storage/` into CLI command modules.

## Entities

### Project Root

A filesystem directory containing a valid `specable.json` and the storage artifacts referenced by that config.

| Attribute | Type | Notes |
|-----------|------|-------|
| `rootPath` | absolute path string | Operational CLI argument; not canonical identity |
| `config` | `ProjectConfig` | Decoded from `specable.json` |
| `storageSummary` | `GraphStoreSummary` | From active backend at inspect time |

**State transitions**:

```text
(uninitialized path) --init--> (initialized root, empty graph)
(initialized root) --inspect--> (descriptor returned)
(initialized root) --init--> ERROR ProjectAlreadyInitialized
```

### ProjectConfig (`specable.json`)

Persisted authoritative project manifest.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `specableVersion` | `1` (literal) | yes | Manifest format version |
| `projectId` | UUID string | yes | Stable identity; generated at init |
| `name` | string | yes | Display name; default basename |
| `schemaVersion` | `1` (literal) | yes | Ontology/graph schema generation |
| `primitiveTypes` | array of type name strings | yes | Nine v0 types; stable order |
| `storage` | `StorageBinding` | yes | Backend type + relative location |
| `createdAt` | ISO-8601 string | yes | Init timestamp (UTC) |

### StorageBinding

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | `"json"` \| `"sqlite"` | yes | Backend discriminator |
| `location` | string | yes | Project-relative path: `"."` for JSON layout root, `"graph.sqlite"` for SQLite |

### GraphStoreSummary

Runtime inspect aggregate (not necessarily persisted).

| Field | Type | Notes |
|-------|------|-------|
| `totalPrimitives` | number | Sum across all types |
| `empty` | boolean | `true` when `totalPrimitives === 0` |
| `countsByType` | record type → number | Per-type counts; all zero at init |

### ProjectDescriptor (inspect DTO)

Public inspect result combining config + summary + operational path.

| Field | Type | Notes |
|-------|------|-------|
| `projectId` | string | From config |
| `name` | string | From config |
| `rootPath` | string | Resolved absolute path |
| `schemaVersion` | `1` | From config |
| `primitiveTypes` | string[] | From config |
| `storage` | `StorageBinding` | From config |
| `graph` | `GraphStoreSummary` | From backend |
| `createdAt` | string | From config |

## JSON backend layout

At init, relative to `rootPath`:

| Path | Content |
|------|---------|
| `specable.json` | `ProjectConfig` |
| `graph.json` | Optional v0-compatible metadata `{ schemaVersion: 1, name }` |
| `objectives.json` | `{ "primitives": [] }` |
| `actors.json` | `{ "primitives": [] }` |
| … (seven more type files) | `{ "primitives": [] }` |

Filenames match [fixture-format.md](../001-product-primitives-v0/contracts/fixture-format.md).

## SQLite backend layout

At init, relative to `rootPath`:

| Path | Content |
|------|---------|
| `specable.json` | `ProjectConfig` with `storage.location: "graph.sqlite"` |
| `graph.sqlite` | SQLite database |

**Tables** (schema version 1):

| Table | Columns | Init state |
|-------|---------|------------|
| `schema_meta` | `key TEXT PRIMARY KEY`, `value TEXT NOT NULL` | row `graph-schema` → `1` |
| `primitives` | `id TEXT PRIMARY KEY`, `type TEXT NOT NULL`, `payload TEXT NOT NULL` | empty |

`payload` stores JSON text of a single primitive document (future CRUD milestone).

## Canonical primitive types

Alphabetical stable list stored in `primitiveTypes`:

1. `Actor`
2. `Capability`
3. `CapabilityConceptLink`
4. `DomainConcept`
5. `ExpectedResult`
6. `Objective`
7. `Persona`
8. `Story`
9. `Workflow`

## Validation rules

### Init-time

| Rule | Error |
|------|-------|
| `specable.json` already exists at target | `ProjectAlreadyInitializedError` |
| Target exists, is directory, has entries, no `specable.json` | `ProjectPathNotEmptyError` |
| `storage` not `json` or `sqlite` | `UnsupportedStorageTypeError` |
| Storage bootstrap fails | `StorageBootstrapError` |
| Cannot create directory (permissions) | `PlatformError` → exit 2 |

### Inspect-time

| Rule | Error |
|------|-------|
| Path missing or not directory | `ProjectNotFoundError` |
| `specable.json` missing | `ProjectNotFoundError` |
| `specable.json` decode failure | `ProjectConfigDecodeError` |
| Config references missing storage artifacts | `IncompleteProjectError` |
| Storage type in config unsupported | `UnsupportedStorageTypeError` |

### Empty-graph sanity (init + inspect)

| Rule | Behavior |
|------|----------|
| `totalPrimitives === 0` | `graph.empty === true` |
| All `countsByType` keys present | Each canonical type reports `0` |
| JSON: all nine files exist | Bootstrap verification |
| SQLite: `primitives` row count `0` | Bootstrap verification |

Full graph validation (Active rules, integrity) is **out of scope** — deferred to v0 validation engine on loaded graphs in later milestones.

## Relationships to v0 model

- `schemaVersion: 1` aligns with v0 `graph-schema: 1`.
- JSON primitive files use the same decode schemas as v0 `GraphLoader`.
- v0 fixture directories without `specable.json` are **not** `ProjectRoot` entities; they remain legacy check targets.

## Future extensions (documented, not this slice)

- `GraphRepository.load` resolves storage via `specable.json` before delegating to JSON or SQLite adapter.
- MCP `project/{projectId}` resource reads `ProjectDescriptor` without exposing raw paths as resource IDs.
- Config migration when `specableVersion` increments.
