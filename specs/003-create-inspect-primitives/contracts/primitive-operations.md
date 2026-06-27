# Library Contract: Primitive Operations

**Package**: `@specable/core`  
**Service**: `PrimitiveService`  
**Consumers**: `@specable/cli` primitive commands; future MCP tools

## Service tag

`@specable/core/PrimitiveService`

## Public methods

All methods return `Effect<_, PrimitiveError | ProjectError | PlatformError, never>` when composed with Live Layer (platform deps absorbed at Layer build).

### `create(input: CreateInput): Effect<Primitive, _, never>`

**Input**:

| Field | Type | Required |
|-------|------|----------|
| `rootPath` | string | yes |
| `type` | AlphaPrimitiveType | yes |
| `name` | string | yes |
| `status` | Status | no (default Draft) |
| `fields` | Record<string, unknown> | no |

**Behavior**:

1. Resolve absolute `rootPath`.
2. Read and decode `specable.json`; fail if not initialized root.
3. Assign system ID per [research.md](../research.md) R1.
4. Merge `type`, `id`, `name`, `status`, and optional `fields`.
5. Decode merged object through domain Schema for `type`.
6. Delegate persist to `StorageBackend.create`.
7. Return decoded `Primitive`.

**Errors**: `UnknownPrimitiveTypeError`, `PrimitiveValidationError`, `DuplicatePrimitiveIdError`, `InvalidProjectRootError`, `IncompleteProjectError`, `PlatformError`

---

### `list(rootPath: string, filter?: { type: AlphaPrimitiveType }): Effect<ReadonlyArray<PrimitiveSummary>, _, never>`

**Behavior**:

1. Validate project root via manifest.
2. Delegate to `StorageBackend.list`.
3. Return summaries sorted by `(type, name, id)`.

**Errors**: `InvalidProjectRootError`, `UnknownPrimitiveTypeError` (invalid filter), `IncompleteProjectError`, `PlatformError`

---

### `get(rootPath: string, id: string): Effect<Primitive, _, never>`

**Behavior**:

1. Validate project root via manifest.
2. Delegate to `StorageBackend.get`.
3. Return full domain `Primitive`.

**Errors**: `PrimitiveNotFoundError`, `InvalidProjectRootError`, `PrimitiveValidationError`, `IncompleteProjectError`, `PlatformError`

## DTO schemas (core)

### `PrimitiveSummary`

| Field | Schema |
|-------|--------|
| `id` | non-empty string |
| `type` | AlphaPrimitiveType literal union |
| `name` | non-empty string |
| `status` | Status union |

### `AlphaPrimitiveType`

Literal union of eight alpha types (excludes CapabilityConceptLink).

## Layer composition

```text
PrimitiveService.Default
  requires: StorageBackend (RoutedStorageBackendLive)
  requires: FileSystem (absorbed at Layer build via parent composition)

RoutedStorageBackendLive
  requires: JsonStorageBackendLive | SqliteStorageBackendLive selection
  requires: FileSystem (+ SqlClient for SQLite path)
```

CLI composition root (`packages/cli/src/services/Layers.ts`):

```text
primitiveServiceLiveLayer =
  PrimitiveService.Default.pipe(
    Layer.provide(routedStorageBackendLiveLayer)
  )
```

Entrypoint (`bin.ts`) merges with `NodeFileSystem.layer` and existing graph Layers.

## Test contract

Library tests MUST cover without CLI:

- Create two types on JSON root → list → get round-trip
- Same flow on SQLite root
- Duplicate ID rejection
- Not found on get
- Unknown type on create
- Invalid field shape → `PrimitiveValidationError` with field path
- List type filter excludes non-matching types

See [quickstart.md](../quickstart.md) for manual validation scenarios.
