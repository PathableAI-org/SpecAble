# Research: Readable Semantic Wiki

**Phase 0** | **Date**: 2026-06-29

## Summary

No unresolved NEEDS CLARIFICATION markers existed in the spec. All major architectural decisions were resolved by reading the existing codebase. This document records the confirmations and minor design decisions made during Phase 0.

## Technology Decisions

### YAML Library for Markdown Backend

| Item | Detail |
|------|--------|
| **Decision** | `js-yaml` (npm: `js-yaml`) |
| **Rationale** | Industry-standard YAML parser for Node.js. 60M+ weekly downloads, MIT license. Supports `load` (returns parsed object) and `dump` (serializes to YAML string). Works well for frontmatter extraction (parse between `---` delimiters) and encoding primitive metadata as YAML. |
| **Alternatives considered** | `yaml` (eemeli/yaml) — also well-maintained but `js-yaml` has wider ecosystem adoption and simpler API for the flat-object use case. Hand-rolled YAML parser — rejects; YAML edge cases (quotes, special chars, multiline) are non-trivial. |
| **Scope** | Scoped to `packages/core` via `MarkdownStorageBackend.ts` only. Not a dependency of `OrgStorageBackend.ts`, `@specable/domain`, or `@specable/cli` library code. |

### Org Property Drawer Parsing

| Item | Detail |
|------|--------|
| **Decision** | Lightweight regex/line-based parser |
| **Rationale** | Org property drawers use a fixed format: `:PROPERTIES:` header, zero or more `:KEY: VALUE` lines, `:END:` terminator. Values are flat (no nesting). Colons in values are allowed — parser handles by splitting only on the first `: ` after the key. No external dependency needed. |
| **Alternatives considered** | Full Org-mode parser library — rejected. Only the property drawer subset is needed; a full parser would add complexity and maintenance burden. |
| **Edge cases** | Empty values (`:KEY:` with no value), values containing colons (`:KEY: some: text`), multiple drawers (only first `:PROPERTIES:`…`:END:` block is parsed), missing `:END:` terminator (reports decode error). |

### Frontmatter/Body Separation

| Item | Detail |
|------|--------|
| **Decision** | Markdown: split on first `---` pair. Org: split before `:PROPERTIES:` and after `:END:`. |
| **Rationale** | Standard convention for YAML frontmatter. For Org, the body is everything before the first `:PROPERTIES:` line outside a drawer (title/headings) and everything after `:END:` (prose). The `#+TITLE:` line is decorative and ignored on decode. |
| **Body handling** | Preserved verbatim as opaque text — no encoding, decoding, or transformation. Stored and returned as-is. |

### File Naming Convention

| Item | Detail |
|------|--------|
| **Decision** | Use the full primitive ID (including random suffix) as the file name stem, plus the backend extension |
| **Rationale** | IDs are guaranteed unique. Using a slug-only name (without suffix) risks collisions when two primitives have similar names. Example: `cap-schedule-session-a1b2.md`, `actor-care-coach-x9k3.org`. |
| **Human readability** | The ID prefix + slug portion makes files identifiable; the suffix disambiguates. This is acceptable — the content inside the file (frontmatter name, body prose) is the primary human-readable surface. |

## Codebase Pattern Confirmations

### StorageBackend Implementation Pattern

Confirmed from `JsonStorageBackend.ts`:

```typescript
// Pattern from JsonStorageBackend.ts — each wiki backend will follow the same pattern
export const makeJsonStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem
  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})
export const JsonStorageBackendLive = Layer.effect(StorageBackend, makeJsonStorageBackend)
```

The analogous wiki backends (`makeMarkdownStorageBackend` / `MarkdownStorageBackendLive` and `makeOrgStorageBackend` / `OrgStorageBackendLive`) will follow the exact same pattern. The `satisfies` keyword ensures the returned object matches the interface at compile time. Each method captures `fs` from the outer scope. All methods have `R = never`.

### Schema Decoding Pattern

Confirmed from `PrimitiveSchemas.ts` — reused as-is for frontmatter/property-drawer metadata:

- Parse frontmatter YAML → `unknown` object
- Call `decodePrimitiveUnknown(type, path, obj)` → `Effect<Primitive, PrimitiveValidationError>`
- Return full decoded primitive

For `list`, project frontmatter fields into `PrimitiveSummary` (id, name, status, type). The existing `decodePrimitiveUnknown` already returns the full `Primitive` — `list` extracts summary fields.

### Error Patterns

Existing errors reused:
- `PrimitiveNotFoundError` — for `get` when ID not found in any type directory
- `PrimitiveValidationError` — for YAML/property-drawer decode failures
- `DuplicatePrimitiveIdError` — for `create` when ID already exists (across all type files)
- `IncompleteProjectError` — for missing required directories or `specable.json`
- `StorageCreateError` / `StorageReadError` — existing error wrappers

### Test Layer Pattern

The existing test layers at `packages/core/test/fixtures/project/layers.ts` demonstrate the pattern:

```typescript
export const jsonStorageTestLayer: Layer.Layer<StorageBackend> = JsonStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)
export const sqliteStorageTestLayer: Layer.Layer<StorageBackend> = SqliteStorageBackendLive.pipe(
  Layer.provide(nodeFileSystemLayer)
)
```

The wiki backends will add analogous test layers (`mdStorageTestLayer` and `orgStorageTestLayer`) following the exact same pattern once the backends exist.

## Open Questions (Rejected as Non-Blocking)

- **Should body prose support Markdown/Org templates for wiki sections?** Deferred to the interpretation layer milestone. This milestone preserves body as opaque text.
- **Should `specable init` create sample wiki files?** No — creates empty directories only. Sample files belong in documentation/examples.
- **Should file names be configurable (e.g., custom ID→filename mapping)?** No — fixed mapping from `wiki-file-layout.ts` keeps things simple and predictable. Configuration would add scope without proven need.