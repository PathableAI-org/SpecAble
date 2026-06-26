# Project Configuration Contract

**File**: `specable.json` (required at project root)  
**Encoding**: JSON (UTF-8)  
**Manifest version**: `specableVersion: 1`

## Purpose

Authoritative SpecAble project manifest. Distinguishes an initialized **project root** from a legacy v0 fixture directory (which may have only `graph.json` and primitive files).

A directory is a SpecAble project root if and only if `specable.json` exists and decodes per this contract.

## Schema

```json
{
  "specableVersion": 1,
  "projectId": "8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
  "name": "demo-json",
  "schemaVersion": 1,
  "primitiveTypes": [
    "Actor",
    "Capability",
    "CapabilityConceptLink",
    "DomainConcept",
    "ExpectedResult",
    "Objective",
    "Persona",
    "Story",
    "Workflow"
  ],
  "storage": {
    "type": "json",
    "location": "."
  },
  "createdAt": "2026-06-26T12:00:00.000Z"
}
```

## Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `specableVersion` | number | yes | Must be literal `1` for this contract |
| `projectId` | string | yes | UUID v4; immutable after init |
| `name` | string | yes | Non-empty display name |
| `schemaVersion` | number | yes | Must be literal `1` (v0 ontology generation) |
| `primitiveTypes` | string[] | yes | Exactly nine canonical types; stable order as init writes |
| `storage` | object | yes | See Storage binding |
| `createdAt` | string | yes | ISO-8601 UTC timestamp |

### Storage binding

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `type` | string | yes | `"json"` \| `"sqlite"` |
| `location` | string | yes | Project-relative path; see [storage-layouts.md](./storage-layouts.md) |

**JSON example** (`location: "."`):

```json
"storage": { "type": "json", "location": "." }
```

**SQLite example**:

```json
"storage": { "type": "sqlite", "location": "graph.sqlite" }
```

## Optional companion file: `graph.json`

JSON backend init MAY write v0-compatible metadata for human familiarity:

```json
{
  "schemaVersion": 1,
  "name": "demo-json"
}
```

`graph.json` is **not** the project root marker. Inspect and future MCP root discovery use `specable.json` only.

## Identity rules

| Identifier | Canonical for agents? | Notes |
|------------|----------------------|-------|
| `projectId` | yes | Use in future MCP root URIs |
| `rootPath` | no | Machine-specific; operational CLI context only |
| `name` | display only | May change in future edit commands |

## Decode failures

Malformed `specable.json` → `ProjectConfigDecodeError` with field path when available.

## Versioning

Increment `specableVersion` when manifest shape changes. Increment `schemaVersion` only when product primitive ontology changes. This milestone ships both at `1`.
