# Write Operations Contract

**Feature**: `002-primitive-crud`  
**Encoding**: JSON (UTF-8)  
**Layout**: Same as [001 fixture format](../../001-product-primitives-v0/contracts/fixture-format.md)

## Persistence model

Each primitive type maps to one JSON file via `FixtureFiles` registry:

| `type` field | File |
|--------------|------|
| `Objective` | `objectives.json` |
| `Actor` | `actors.json` |
| `Persona` | `personas.json` |
| `DomainConcept` | `domain-concepts.json` |
| `Capability` | `capabilities.json` |
| `CapabilityConceptLink` | `capability-concept-links.json` |
| `ExpectedResult` | `expected-results.json` |
| `Workflow` | `workflows.json` |
| `Story` | `stories.json` |

File envelope:

```json
{
  "primitives": [ /* ordered by id ascending after write */ ]
}
```

## Write lifecycle

```text
JSON input → parse → Schema decode (domain) → business rules (ID, type match)
    → mutate primitives array → deterministic encode → write temp → rename
```

## Atomic write

1. Write encoded content to `<file>.tmp.<pid>`
2. `rename` temp → target (atomic on same filesystem)
3. On any failure before rename, temp file removed; original unchanged

## Deterministic encoding

| Rule | Value |
|------|-------|
| Indent | 2 spaces |
| Key order | Recursive lexicographic sort |
| Array order | `primitives` sorted by `id` ascending |
| Trailing newline | Required |
| Unicode | UTF-8, unescaped where JSON allows |

## ID index

Before create/update, scan all type files (or use `GraphRepository.load`) to build global `id → { type, file }` map.

| Operation | ID rule |
|-----------|---------|
| Create | `id` MUST NOT exist |
| Update | `id` MUST exist; payload `id` MUST match |
| Delete | `id` MUST exist |
| Get | `id` MUST exist |

## Type immutability

The `type` field of a stored primitive MUST NOT change via update. Cross-type relocation requires delete + create (out of scope).

## Schema validation boundary

| Check | On write | On `specable check` |
|-------|----------|---------------------|
| JSON syntax | yes | yes |
| Schema field types | yes | yes |
| Required Active relationships | no | yes |
| Broken references | no | yes (failure) |
| Duplicate story triples | no | yes |

## Empty file policy

After deleting the last primitive in a file, persist:

```json
{
  "primitives": []
}
```

Do not delete the type file.

## Project metadata

`graph.json` is **not** modified by primitive CRUD except via `specable init`. Optional fields: `schemaVersion`, `name`, `description`.

## WriteResult schema

```json
{
  "action": "created",
  "id": "actor-coach",
  "type": "Actor",
  "file": "actors.json"
}
```

`action` enum: `created` | `updated` | `deleted`

## Error mapping

| Condition | Error tag | Exit |
|-----------|-----------|------|
| Unknown project path | `GraphProjectNotFoundError` | 2 |
| Schema decode failure | `FixtureDecodeError` | 2 |
| Duplicate ID | `DuplicateIdError` | 2 |
| Missing ID | `PrimitiveNotFoundError` | 2 |
| Platform I/O | `PlatformError` | 2 |

## Compatibility with loader

After any successful write, the following MUST succeed without modification to `001` loader code:

```typescript
GraphRepository.load(projectPath)
```

Mutations MUST NOT introduce duplicate IDs or invalid envelope shapes.
