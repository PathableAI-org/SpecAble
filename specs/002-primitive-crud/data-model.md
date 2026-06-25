# Data Model: Primitive CRUD for Local Graph Projects

**Feature**: `002-primitive-crud`  
**Date**: 2026-06-24

## Relationship to `001`

This feature **does not** introduce new primitive types or schema fields. All `PrimitiveRecord` payloads conform to `@specable/domain` schemas and the graph project layout in `specs/001-product-primitives-v0/contracts/fixture-format.md`.

## Package boundaries

| Concern | Package | Location |
|---------|---------|----------|
| Primitive schemas | `@specable/domain` | unchanged |
| CRUD + load | `@specable/cli` | `packages/cli/src/graph/` |
| CLI adapters | `@specable/cli` | `packages/cli/src/cli/` |

## Service boundaries (`@specable/cli`)

| Service | Role | Consumers |
|---------|------|-----------|
| `GraphRepository` | `load(projectPath) → ProductGraph` | Validation, integrity, summary, `--check` |
| `PrimitiveStore` | `create/get/list/update/delete` | CLI primitive commands, future MCP write tools |
| `GraphLoader` / persistence helpers | File-backed JSON read/write (internal) | Composed into services via Layers only |
| `FileSystem` | Platform I/O | `services/Layers.ts` only |

Downstream feature modules (validation, integrity, summary) MUST depend on `GraphRepository`, not `PrimitiveStore`.

## PrimitiveStore API (library contract)

```typescript
// Conceptual — exact Effect.Service shape in implementation

type PrimitiveStoreError =
  | DuplicateIdError
  | FixtureDecodeError
  | GraphProjectNotFoundError
  | PrimitiveNotFoundError
  | PlatformError

interface PrimitiveStore {
  readonly create: (
    projectPath: string,
    input: unknown // decoded via domain schema after JSON parse
  ) => Effect<Primitive, PrimitiveStoreError>

  readonly get: (
    projectPath: string,
    id: PrimitiveId
  ) => Effect<Primitive, PrimitiveStoreError>

  readonly list: (
    projectPath: string,
    filter?: { readonly type?: PrimitiveType }
  ) => Effect<ReadonlyArray<Primitive>, PrimitiveStoreError>

  readonly update: (
    projectPath: string,
    id: PrimitiveId,
    input: unknown
  ) => Effect<Primitive, PrimitiveStoreError>

  readonly delete: (
    projectPath: string,
    id: PrimitiveId
  ) => Effect<void, PrimitiveStoreError>
}
```

## Operation semantics

### Create

| Step | Behavior |
|------|----------|
| 1 | Parse JSON from caller |
| 2 | Schema-decode to `Primitive` using type-specific schema from `FixtureFiles` registry |
| 3 | Verify `id` not present in any type file (global uniqueness) |
| 4 | Resolve target filename from `primitive.type` |
| 5 | Load existing file or start `{ primitives: [] }` |
| 6 | Append primitive; sort `primitives` by `id` |
| 7 | Encode deterministically; atomic write |

### Get

| Step | Behavior |
|------|----------|
| 1 | Load graph index via lightweight scan or `GraphRepository.load` |
| 2 | Return primitive by `id` or fail `PrimitiveNotFoundError` |

### List

| Step | Behavior |
|------|----------|
| 1 | If `--type` filter: read single type file |
| 2 | Else: read all type files (or load graph) |
| 3 | Return sorted by `id` |

### Update

| Step | Behavior |
|------|----------|
| 1 | Locate existing primitive by `id` (knows current type/file) |
| 2 | Decode payload; require `payload.id === id` |
| 3 | Require `payload.type === existing.type` |
| 4 | Verify no *other* primitive shares `id` if id changed (id cannot change — same id required) |
| 5 | Replace entry in `primitives` array; atomic write |

### Delete

| Step | Behavior |
|------|----------|
| 1 | Locate primitive; remove from array |
| 2 | If array empty, write `{ "primitives": [] }` |
| 3 | Atomic write |

## Init project model

| Artifact | Default init | `--scaffold-files` |
|----------|--------------|-------------------|
| `graph.json` | Created with `schemaVersion: 1`, optional `--name` | Same |
| `objectives.json` … `stories.json` | Not created (lazy) | Created empty |
| Directory | Created if missing | Same |

## Tagged errors

### PrimitiveNotFoundError

| Field | Type | Description |
|-------|------|-------------|
| `projectPath` | string | Graph root |
| `primitiveId` | `PrimitiveId` | Requested ID |

### DuplicateIdError (reused from `001`)

Emitted when create/update would introduce an ID already present in the project.

## CLI output DTOs

### WriteResult (stdout JSON on create/update/delete)

| Field | Type | Description |
|-------|------|-------------|
| `action` | `"created"` \| `"updated"` \| `"deleted"` | Operation performed |
| `id` | string | Primitive ID |
| `type` | PrimitiveType | Domain type |
| `file` | string | Relative path to mutated file |

### Get/List output

Emit the primitive JSON object (get) or `{ "primitives": [...] }` (list) — Schema-encoded.

## State transitions

Primitive `status` (`Draft` | `Active` | `Deprecated`) may change via **update**; CRUD does not enforce Active completeness rules. Status-aware validation runs only in `specable check` (or optional `--check`).

## Index consistency

After any mutation, the on-disk state MUST remain decodable by `GraphLoader` with the same rules as `001`:

- No duplicate IDs across types
- Each entry's `type` matches its file
- References may be dangling until `check` is run
