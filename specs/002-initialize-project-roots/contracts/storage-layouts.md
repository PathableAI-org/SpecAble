# Storage Layout Contract

**Feature**: `002-initialize-project-roots`  
**Backends**: `json`, `sqlite`

Both backends honor the same **semantic empty-graph contract** after init:

- `primitiveTypes`: nine canonical v0 types (see [project-config.md](./project-config.md))
- `totalPrimitives`: `0`
- `graph.empty`: `true`
- `countsByType`: every type → `0`

## JSON backend

**Storage binding**: `{ "type": "json", "location": "." }`

**Project root tree after init**:

```text
<root>/
├── specable.json
├── graph.json                    # optional v0-compatible metadata
├── objectives.json               # { "primitives": [] }
├── actors.json
├── personas.json
├── domain-concepts.json
├── capabilities.json
├── capability-concept-links.json
├── expected-results.json
├── workflows.json
└── stories.json
```

**Per-type file contract**: Identical to [fixture-format.md](../../001-product-primitives-v0/contracts/fixture-format.md) — JSON object with `primitives` array (empty at init).

**Verification** (inspect / tests):

- All nine type files exist.
- Each file decodes as `{ primitives: [] }`.
- No extra primitive instances.

## SQLite backend

**Storage binding**: `{ "type": "sqlite", "location": "graph.sqlite" }`

**Project root tree after init**:

```text
<root>/
├── specable.json
└── graph.sqlite
```

### Database schema (graph-schema 1)

**Table `schema_meta`**

| Column | Type | Notes |
|--------|------|-------|
| `key` | TEXT PRIMARY KEY | |
| `value` | TEXT NOT NULL | |

Init seed row: `("graph-schema", "1")`.

**Table `primitives`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | Canonical primitive ID (empty at init) |
| `type` | TEXT NOT NULL | Primitive type name |
| `payload` | TEXT NOT NULL | JSON-encoded primitive document |

Init state: zero rows in `primitives`.

**Verification** (inspect / tests):

- `graph.sqlite` exists and opens.
- `schema_meta` contains `graph-schema = 1`.
- `SELECT COUNT(*) FROM primitives` → `0`.

## Parity checklist

Reviewers comparing JSON and SQLite roots after init should confirm:

| Check | JSON | SQLite |
|-------|------|--------|
| `specable.json` present | yes | yes |
| Same `projectId` format | UUID | UUID |
| Same `schemaVersion` | `1` | `1` |
| Same `primitiveTypes` list | nine types | nine types |
| `graph.empty` | `true` | `true` |
| `graph.totalPrimitives` | `0` | `0` |
| Per-type count | all `0` | all `0` |

## Out of scope

- Primitive CRUD read/write paths (milestone 2)
- Migrations between backends
- Compression or encryption at rest
- Hosted or remote storage
