# Storage CRUD Contract

**Package**: `@specable/core`  
**Service**: `StorageBackend` (extended)  
**Implementations**: `JsonStorageBackend`, `SqliteStorageBackend`, `RoutedStorageBackend`

## Extended service interface

Existing methods unchanged in signature:

- `bootstrap(projectRoot, config)`
- `describe(projectRoot, config)` — **behavior update**: returns counts for non-empty graphs

New methods:

### `create(projectRoot, config, primitive): Effect<void, StorageCreateError, never>`

Persist one domain-decoded `Primitive`.

| Rule | Detail |
|------|--------|
| ID uniqueness | Must reject if `primitive.id` exists anywhere in project store |
| Type routing | JSON: append to type's file; SQLite: INSERT row |
| Atomicity | JSON: temp file + rename for modified type file; SQLite: single INSERT transaction |

**Errors**: `DuplicatePrimitiveIdError`, `IncompleteProjectError`, `PlatformError`

---

### `list(projectRoot, config, filter?): Effect<ReadonlyArray<PrimitiveSummary>, StorageReadError, never>`

| Parameter | Detail |
|-----------|--------|
| `filter.type` | Optional; restrict to one canonical type |

**JSON implementation**: Read type file(s); extract summary fields from each entry without requiring full graph load of unrelated validation.

**SQLite implementation**: `SELECT id, type, payload` with optional `WHERE type = ?`; decode payload for summary fields.

**Errors**: `IncompleteProjectError`, `PrimitiveValidationError`, `PlatformError`

---

### `get(projectRoot, config, id): Effect<Primitive, StorageReadError, never>`

| Rule | Detail |
|------|--------|
| Lookup | JSON: scan all type files for matching `id`; SQLite: `SELECT` by PK |
| Decode | Full domain Schema for stored type |
| Not found | `PrimitiveNotFoundError` |

---

### `describe` (updated behavior)

| Before (002) | After (003) |
|--------------|-------------|
| Fails if any primitives exist | Returns accurate `GraphStoreSummary` |
| Requires empty type files | Counts entries per type |

**GraphStoreSummary** fields unchanged; `empty` is `false` when `totalPrimitives > 0`.

## JSON persistence

**File layout**: Unchanged from [002 storage-layouts.md](../../002-initialize-project-roots/contracts/storage-layouts.md).

**Create algorithm**:

1. Determine filename from `PRIMITIVE_TYPE_FILES[primitive.type]`.
2. Read and decode `{ primitives: [...] }`.
3. Scan all nine type files for duplicate `id` (if found → error).
4. Append primitive to array.
5. Write to temp file in same directory; rename to target filename.

**List algorithm**:

1. If filter present, read single type file; else read all nine files.
2. Map each entry to `PrimitiveSummary`.

**Get algorithm**:

1. Iterate type files (or use known type if indexed); find matching `id`.
2. Decode full entry through `PrimitiveSchemas`.

## SQLite persistence

**Schema**: Unchanged from milestone 002.

```sql
CREATE TABLE primitives (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT NOT NULL
);
```

**Create**: `INSERT INTO primitives (id, type, payload) VALUES (?, ?, ?)` with JSON.stringify(payload).

**List**: `SELECT id, type, payload FROM primitives [WHERE type = ?] ORDER BY type, id`.

**Get**: `SELECT payload, type FROM primitives WHERE id = ? LIMIT 1`.

**Describe**: `SELECT type, COUNT(*) FROM primitives GROUP BY type` merged with zero counts for missing types.

## RoutedStorageBackend

Routes `create`, `list`, `get` to JSON or SQLite implementation based on `config.storage.type`—same pattern as `bootstrap` and `describe`.

## PrimitiveSchemas registry

**Location**: `packages/core/src/storage/PrimitiveSchemas.ts`

| Function | Purpose |
|----------|---------|
| `schemaForType(type)` | Returns domain Schema for decode/encode |
| `isAlphaCreatableType(type)` | Type guard for eight alpha types |
| `summaryFromPrimitive(p)` | Extract list DTO fields |

Decode at boundaries via `SchemaDecode.ts` helpers (Effect `Schema.decodeUnknown`).

## Parity requirements

For equivalent synthetic create inputs on separate JSON and SQLite roots:

- `list` returns same count and matching summaries (same ids if roots initialized separately will differ—compare shape not ID equality across roots)
- `get` returns semantically equivalent field sets per primitive
- `describe` reports matching `countsByType` and `totalPrimitives`

Cross-root ID equality is **not** required; within-root stability is required.

## Out of scope

- Update, delete, or upsert operations
- Relationship edge storage
- Cross-root transactions
- Migration of v0 fixture directories without `specable.json`
