# StorageBackend Contract Reference (Wiki Backends)

**Date**: 2026-06-29 | **Feature**: Readable Semantic Wiki

## Contract Purpose

This document describes how the `StorageBackend` contract applies to the Markdown and Org wiki backends. It serves as a reference for implementers and test authors. The canonical contract is `packages/core/src/storage/StorageBackend.ts`.

## Interface

```typescript
interface StorageBackendService {
  bootstrap(projectRoot: string, config: ProjectConfig): Effect<void, PlatformError | StorageBootstrapError, never>
  create(projectRoot: string, config: ProjectConfig, primitive: Primitive): Effect<void, StorageCreateError, never>
  describe(projectRoot: string, config: ProjectConfig): Effect<GraphStoreSummary, IncompleteProjectError | PlatformError, never>
  get(projectRoot: string, config: ProjectConfig, id: string): Effect<Primitive, StorageReadError, never>
  list(projectRoot: string, config: ProjectConfig, filter?: PrimitiveListFilter): Effect<readonly PrimitiveSummary[], StorageReadError, never>
}
```

## Method Contracts — Wiki-Specific Behavior

### `bootstrap`

**In**: `projectRoot`, `config` (where `config.storage.type === "md"` or `"org"`)

**Out**: Void

**Behavior**:
1. Validate `config.storage.type` matches this backend (`"md"` for Markdown, `"org"` for Org)
2. Create per-type directories for all 9 canonical primitive types under `projectRoot`
3. Do NOT create any primitive files — bootstrap creates the empty layout
4. Do NOT write `specable.json` (that is `ProjectRootService`'s responsibility)

**Error conditions**:
- `PlatformError` — directory creation fails (permissions, disk full, etc.)
- `IncompleteProjectError` — `config.storage.type` does not match this backend

### `describe`

**In**: `projectRoot`, `config`

**Out**: `GraphStoreSummary` (type counts and metadata)

**Behavior**:
1. Scan all 9 type directories for files matching the backend extension
2. Read each file's frontmatter/property-drawer to determine type
3. Count primitives per type
4. Report empty types as zero, not absent

**Error conditions**:
- `IncompleteProjectError` — required directory missing
- `PlatformError` — can't read directory

### `create`

**In**: `projectRoot`, `config`, `primitive` (with id, type, name, status, type-specific fields, body prose)

**Out**: Void

**Behavior**:
1. Determine target directory from `PRIMITIVE_TYPE_DIRECTORIES[primitive.type]`
2. Determine file path: `{projectRoot}/{directory}/{id}.md` or `.org`
3. Check for duplicate ID across ALL type directories (not just the target type's directory)
4. Encode primitive metadata as YAML frontmatter or Org property drawer
5. Write file atomically: temp-file + rename pattern (same as JSON backend)
6. Body prose is preserved from the input primitive

**Error conditions**:
- `DuplicatePrimitiveIdError` — ID already exists in any type directory
- `IncompleteProjectError` — directory missing (not bootstrapped)
- `PlatformError` — file write fails

### `get`

**In**: `projectRoot`, `config`, `id`

**Out**: `Primitive` (full decoded primitive with body prose)

**Behavior**:
1. Scan all 9 type directories for a file named `{id}.md` or `{id}.org`
2. If no match found in any directory → `PrimitiveNotFoundError`
3. Read file content
4. Parse frontmatter/property-drawer
5. Validate against domain schema via `decodePrimitiveUnknown`
6. Return decoded primitive with body prose

**Error conditions**:
- `PrimitiveNotFoundError` — no file with this ID exists
- `PrimitiveValidationError` — frontmatter/property-drawer does not match domain schema
- `IncompleteProjectError` — directory missing or `specable.json` not found
- `PlatformError` — file read fails

### `list`

**In**: `projectRoot`, `config`, `filter?` (optional type filter)

**Out**: `readonly PrimitiveSummary[]`

**Behavior**:
1. Determine which type directories to scan: all 8 alpha types, or just the filtered type
2. For each applicable directory, list files matching the backend extension
3. Read each file's frontmatter/property-drawer
4. Project fields into `PrimitiveSummary` (id, name, status, type)
5. Return all summaries as an array

**Error conditions**:
- `PrimitiveValidationError` — any file has malformed metadata
- `IncompleteProjectError` — directory missing
- `PlatformError` — directory read fails

**Performance note**: For projects with hundreds of primitives, `list` reads all files in all applicable type directories. This is acceptable for alpha/locally-hosted projects. Future optimization (caching, indexing) is deferred.

## Error Contract

| Error | Tag | When Raised | Fields |
|-------|-----|-------------|--------|
| `PrimitiveNotFoundError` | `"PrimitiveNotFoundError"` | `get` with non-existent ID | `id` |
| `PrimitiveValidationError` | `"PrimitiveValidationError"` | `get`/`list` when metadata decode fails | `path`, `type`, `fieldPaths`, `message` |
| `DuplicatePrimitiveIdError` | `"DuplicatePrimitiveIdError"` | `create` with existing ID | `id` |
| `IncompleteProjectError` | `"IncompleteProjectError"` | bootstrap/describe when required dirs missing | `path`, `message` |
| `StorageCreateError` | `"StorageCreateError"` | `create` on any failure | `cause` |
| `StorageReadError` | `"StorageReadError"` | `get`/`list` on any failure | `cause` |
| `PlatformError` | PlatformError | File system I/O failures | n/a (from `@effect/platform`) |

## Configuration Contract

The `ProjectConfig.storage` field controls routing:

```json
{
  "storage": {
    "type": "md",
    "location": "."
  }
}
```

For Markdown-backed projects: `type: "md"`, `location: "."`.
For Org-backed projects: `type: "org"`, `location: "."`.

## File Format Contract

### Markdown Frontmatter

- `---` delimiter on line 1
- YAML block (key-value pairs, lists, scalars)
- Closing `---` delimiter (on its own line)
- Body prose follows (everything after closing `---`)
- Metadata fields map directly to domain schema field names
- Array fields (relationships) are YAML lists
- `description` field is YAML multi-line scalar (mapped from domain schema)

### Org Property Drawer

- `:PROPERTIES:` header on its own line
- Zero or more `:KEY: VALUE` lines
- `:END:` terminator on its own line
- Body prose follows after a blank line
- Metadata keys are lowercase (matching domain schema field names)
- Array fields are space-separated values on one line (no comma needed)
- Colons in values are allowed; parser splits on first `: ` after leading `:KEY`

## Shared Wiki File-Layout Module

The `wiki-file-layout.ts` module is the single source of truth for:

1. `PRIMITIVE_TYPE_DIRECTORIES` — canonical type → directory name mapping
2. `WIKI_TYPE_DIRECTORY_ENTRIES` — all 9 type entries with directory name + extension
3. `ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES` — 8 writeable type entries (excludes CapabilityConceptLink)
4. `directoryForType(type)` — returns directory name for a primitive type
5. `filePathFor(projectRoot, type, id, extension)` — returns the full file path
6. `idFromFilename(filename)` — strips extension to recover the ID
7. `scanTypeDirectory(fs, projectRoot, directory, extension)` — scans dir for matching files
8. `sanitizeIdForFile(id)` — validates/cleans ID for filesystem safety (pass-through with validation)

Both backends import from this single module, ensuring deterministic, consistent file layouts.