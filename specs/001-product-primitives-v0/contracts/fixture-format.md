# Fixture Format Contract

**Version**: `graph-schema: 1`  
**Encoding**: YAML 1.2  
**Discovery**: All files listed below relative to graph project root.

## Project metadata (optional)

**File**: `graph.yaml`

```yaml
schemaVersion: 1
name: Example Product Graph
description: Optional project description
```

## Primitive type files

Each file is a YAML mapping with a `primitives` array. Entries MUST include `type` matching the file's expected type (redundant `type` field enables cross-file validation).

| File | `type` value |
|------|----------------|
| `objectives.yaml` | `Objective` |
| `actors.yaml` | `Actor` |
| `personas.yaml` | `Persona` |
| `domain-concepts.yaml` | `DomainConcept` |
| `capabilities.yaml` | `Capability` |
| `capability-concept-links.yaml` | `CapabilityConceptLink` |
| `expected-results.yaml` | `ExpectedResult` |
| `workflows.yaml` | `Workflow` |
| `stories.yaml` | `Story` |

Missing file → treat as `{ primitives: [] }`.

## Minimal Active story example

```yaml
primitives:
  - type: Story
    id: story-001
    name: Coach schedules session
    status: Active
    actor: { id: actor-coach }
    capability: { id: cap-schedule-session }
    expectedResult: { id: er-session-scheduled }
    workflows:
      - { id: wf-scheduling }
    # text omitted → generated at validation/summary time
```

## Reference fields

References are either:
- string ID (`actor: actor-coach`), or
- object `{ id: actor-coach, role: Primary }`

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

Examples MUST NOT reference real Pathable/Notion content.

## Decode pipeline

```text
YAML bytes
  → parse (yaml library)
  → Schema.decodeUnknown (per-file union or typed file schema)
  → normalize to ProductGraph
```

Decode errors include file path and JSON Pointer-style field path.
