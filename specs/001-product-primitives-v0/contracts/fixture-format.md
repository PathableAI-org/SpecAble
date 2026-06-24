# Fixture Format Contract

**Version**: `graph-schema: 1`  
**Encoding**: JSON (UTF-8)  
**Discovery**: All files listed below relative to graph project root.

v0 accepts **JSON only** for graph project fixtures (FR-061). YAML input is out of scope.

## Project metadata (optional)

**File**: `graph.json`

```json
{
  "schemaVersion": 1,
  "name": "Example Product Graph",
  "description": "Optional project description"
}
```

## Primitive type files

Each file is a JSON object with a `primitives` array. Entries MUST include `type` matching the file's expected type (redundant `type` field enables cross-file validation).

| File | `type` value |
|------|----------------|
| `objectives.json` | `Objective` |
| `actors.json` | `Actor` |
| `personas.json` | `Persona` |
| `domain-concepts.json` | `DomainConcept` |
| `capabilities.json` | `Capability` |
| `capability-concept-links.json` | `CapabilityConceptLink` |
| `expected-results.json` | `ExpectedResult` |
| `workflows.json` | `Workflow` |
| `stories.json` | `Story` |

Missing file → treat as `{ "primitives": [] }`.

Non-`.json` primitive type files MUST NOT be loaded.

## Minimal Active story example

```json
{
  "primitives": [
    {
      "type": "Story",
      "id": "story-001",
      "name": "Coach schedules session",
      "status": "Active",
      "actor": { "id": "actor-coach" },
      "capability": { "id": "cap-schedule-session" },
      "expectedResult": { "id": "er-session-scheduled" },
      "workflows": [{ "id": "wf-scheduling" }]
    }
  ]
}
```

Omitted `text` → generated at validation/summary time.

## Reference fields

References are either:
- string ID (`"actor": "actor-coach"`), or
- object `{ "id": "actor-coach", "role": "Primary" }`

These IDs are canonical primitive IDs. At decode time they become branded `PrimitiveId`
values in `@specable/domain`; they are not storage-backend IDs such as Notion page IDs,
SQL row IDs, or Confluence page IDs.

Role required where Primary Actor rules apply (`Persona.primaryActors`, `Workflow.primaryActors`).

## Bundled examples

| Path | Purpose |
|------|---------|
| `packages/cli/examples/generic/valid` | Small domain-neutral valid graph |
| `packages/cli/examples/generic/invalid` | Documented mistake patterns |
| `packages/cli/examples/coachbridge-synthetic/valid` | Fictional CoachBridge-like graph |
| `packages/cli/examples/coachbridge-synthetic/invalid` | Synthetic invalid variant |

Examples MUST NOT reference real Pathable/Notion content. All primitive files use `.json`.

## Decode pipeline

```text
JSON bytes
  → JSON.parse (Node built-in)
  → Schema.decodeUnknown (per-file union or typed file schema)
  → normalize to ProductGraph
```

Decode errors include file path and JSON Pointer-style field path. Malformed JSON or schema decode failure → CLI exit code `2`.
