# Data Model: Create and Inspect Primitives

**Feature**: `003-create-inspect-primitives`  
**Date**: 2026-06-27

## Package boundaries

| Concern | Package | Location |
|---------|---------|----------|
| Primitive type schemas | `@specable/domain` | `packages/domain/src/primitives/` (unchanged) |
| Primitive CRUD, storage persistence, ID assignment | `@specable/core` | `packages/core/src/primitive/`, `packages/core/src/storage/` |
| CLI commands (thin adapters) | `@specable/cli` | `packages/cli/src/cli/` |
| v0 graph load, validation, integrity | `@specable/cli` | `packages/cli/src/graph/`, `validation/`, `integrity/` (unchanged) |

## Service boundaries (`@specable/core`)

| Service | Role | Consumers |
|---------|------|-----------|
| `PrimitiveService` | `create`, `list`, `get` | `@specable/cli` primitive commands; future MCP tools |
| `ProjectRootService` | `initialize`, `describe` (unchanged) | Init / project show commands |
| `StorageBackend` | `bootstrap`, `describe`, **`create`**, **`list`**, **`get`** | `ProjectRootService`, `PrimitiveService` |
| `FileSystem` | Platform I/O | Composed at CLI/MCP entrypoints |

**Layer exports** (unchanged paths, extended contracts):

| Layer module | Provides |
|--------------|----------|
| `JsonStorageBackendLive` | `StorageBackend` for JSON file layout |
| `SqliteStorageBackendLive` | `StorageBackend` for SQLite |
| `RoutedStorageBackendLive` | Routes by `config.storage.type` |
| `PrimitiveService.Default` | Orchestrates manifest read + storage CRUD |

## Entities

### Product Primitive (domain)

A typed graph node persisted in project storage. Full shape defined by `@specable/domain` per-type schemas extending `PrimitiveBaseFields`.

| Field | Type | Required at Draft create | Notes |
|-------|------|--------------------------|-------|
| `type` | literal per type | yes | Discriminator (e.g., `"Capability"`) |
| `id` | string | yes | System-assigned at create; see R1 |
| `name` | string | yes | Display name from CLI `--name` |
| `status` | `Draft` \| `Active` \| `Deprecated` | yes | Default `Draft` |
| `description`, `evidence`, `notes`, `tags`, `confidence` | various | no | Base optional metadata |
| Type-specific fields | refs / strings / arrays | no | All optional at Schema level for Draft |

**Alpha create-supported types** (8): Objective, Actor, Persona, DomainConcept, Capability, ExpectedResult, Workflow, Story.

**Init-only / decode-only this milestone**: CapabilityConceptLink (empty at init; no create command).

### PrimitiveSummary (core DTO)

Lightweight list projection.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable primitive ID |
| `type` | alpha type literal | yes | Canonical type name |
| `name` | string | yes | Display name |
| `status` | Status | yes | Current lifecycle status |

### CreateInput (core / CLI boundary)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `rootPath` | string | yes | Project root directory |
| `type` | alpha type literal | yes | Target primitive type |
| `name` | string | yes | Display name |
| `status` | Status | no | Default `Draft` |
| `fields` | record of unknown | no | Optional top-level semantic fields from `--set` |

### Canonical Read Projection

Same as decoded domain `Primitive` for the requested ID—returned by `get`. No backend-specific fields exposed.

### GraphStoreSummary (updated behavior)

Existing entity from milestone 002; **`describe` behavior changes**:

| Field | Type | Notes |
|-------|------|-------|
| `countsByType` | map type → number | Counts persisted primitives per canonical type |
| `totalPrimitives` | number | Sum of all counts |
| `empty` | boolean | `true` iff `totalPrimitives === 0` |

Previously `describe` failed when graph was non-empty; after this feature it reports accurate counts.

## State transitions

```text
(empty graph) --create--> (graph with N primitives)
(graph with primitives) --list--> (summaries returned)
(graph with primitives) --get(id)--> (full projection | not found error)
(graph with primitives) --create duplicate id--> ERROR DuplicatePrimitiveIdError
(invalid root) --create|list|get--> ERROR InvalidProjectRootError
(unknown type) --create--> ERROR UnknownPrimitiveTypeError
(invalid fields) --create--> ERROR PrimitiveValidationError (no persist)
```

No update or delete transitions this milestone.

## Validation rules

### Create-time (this milestone)

| Rule | Enforcement |
|------|-------------|
| Root must have valid `specable.json` | `PrimitiveService` reads manifest before storage |
| Type must be one of eight alpha types | Service rejects before storage |
| `name` non-empty | Domain Schema |
| `status` valid literal | Domain Schema |
| `id` unique within project | Storage backend global check |
| Field shapes match type Schema | `Schema.decodeUnknown` after merge |
| Active-status relationship requirements | **Not enforced** (deferred) |

### List / get

| Rule | Enforcement |
|------|-------------|
| Root valid | Manifest decode |
| Type filter valid alpha type if provided | Service |
| Get ID exists | Storage → `PrimitiveNotFoundError` |
| Stored payload decodes | Storage → validation/decode error |

## Storage persistence shapes

### JSON backend

Per-type file `{ "primitives": [ Primitive, ... ] }` using v0 filenames from `PRIMITIVE_TYPE_FILES`.

### SQLite backend

Table `primitives`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | Primitive ID |
| `type` | TEXT | Canonical type name |
| `payload` | TEXT | JSON-encoded domain primitive |

## Error entities (core)

| Error | When |
|-------|------|
| `UnknownPrimitiveTypeError` | Create with unsupported type |
| `PrimitiveValidationError` | Schema decode failure; includes field paths |
| `DuplicatePrimitiveIdError` | ID collision on create |
| `PrimitiveNotFoundError` | Get by missing ID |
| `InvalidProjectRootError` | Missing/invalid manifest (wraps existing project errors) |
| `IncompleteProjectError` | Corrupt storage artifact on read |
| `PlatformError` | Filesystem / SQL I/O failures |

## Relationships to prior milestone entities

```text
Project Root (002)
  └── contains Graph Namespace
        └── Product Primitive instances (this feature)
              └── identified by Primitive ID
```

Relationship edges between primitives are **not** created or queried this milestone.

## ID prefix reference (system-assigned)

| Type | Prefix | Example |
|------|--------|---------|
| Actor | `actor-` | `actor-coach-a1b2` |
| Capability | `cap-` | `cap-schedule-session-x7k9` |
| Objective | `obj-` | `obj-improve-utilization-m3p4` |
| Persona | `persona-` | `persona-busy-professional-q2w8` |
| DomainConcept | `concept-` | `concept-appointment-n5j6` |
| ExpectedResult | `result-` | `result-appointment-booked-h4t1` |
| Workflow | `workflow-` | `workflow-booking-v8c3` |
| Story | `story-` | `story-book-appointment-z9d2` |

Suffix is 4-character base36 random segment appended after slugified name.
