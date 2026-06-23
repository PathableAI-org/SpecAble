# Data Model: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Date**: 2026-06-23

## Overview

A **graph project** is a directory of YAML fixture files representing product primitives and typed references. The in-memory **ProductGraph** indexes primitives by `id` and `type`, materializes reference edges, and feeds validation, integrity analysis, and summary generation.

All primitives share common metadata:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable, globally unique within project |
| `name` | string | yes | Display name for summaries and story template |
| `status` | `Draft` \| `Active` \| `Deprecated` | yes | Controls validation strictness |
| `description` | string | conditional | Required per-type rules below |

Optional cross-cutting fields (when applicable): `notes`, `tags`, `evidence`, `confidence`.

## Primitive types

### Objective

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `description` | yes | Why work matters |
| `successCriteria` | yes | Outcome framing |
| `workflows` | ≥1 ref | Workflow IDs |
| `expectedResults` | optional | Alternative/supporting linkage |

Draft may omit links; Active requires ≥1 Workflow **or** Expected Result reference (prefer both when available).

### Actor

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `description` | yes | |
| `category` | yes | `Human` \| `System` \| `AI` \| `Organization` \| `External` |

References optional at creation; Active disconnected actors produce **warnings**.

### Persona

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `description` | yes | Context |
| `primaryActors` | ≥1 Actor ref with role Primary | Typed refs |
| `goalsOrPainPoints` | yes | Goals/pain/constraints |
| `evidence` | yes unless `confidence: Hypothesis` | Artifact/reference string |

Warnings: persona resembles actor naming; missing evidence when not Hypothesis.

### DomainConcept

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `definition` | yes | Semantic definition |

Warnings: no capability concept links / related concepts / evidence; implementation-shaped naming patterns (regex list in validation module).

### Capability

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `description` | yes | Operational ability |
| `actors` | ≥1 Actor ref | Beneficiary/user refs |
| `expectedResults` | ≥1 ExpectedResult ref | Produced outcomes |
| `workflows` | ≥1 Workflow ref | Appears in workflows |
| `domainConcepts` | ≥1 DomainConcept ref **or** via CCL | Prefer Capability Concept Link |

Warnings: overly broad/narrow/implementation-specific heuristics.

### CapabilityConceptLink

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `capability` | exactly 1 ref | |
| `domainConcept` | exactly 1 ref | |
| `role` | yes | `Reads` \| `Creates` \| `Updates` \| `Deletes` \| `References` \| `Attaches` \| `Summarizes` \| `Approves` \| `Exports` |
| `importance` | yes | `Primary` \| `Secondary` \| `Supporting` |

### ExpectedResult

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `name` | yes | State-like phrasing enforced by lint rules |
| `definition` | yes | Notes/definition |
| `capabilities` | ≥1 Capability ref | Producers |
| `objectives` | ≥1 Objective ref | Supported objectives |

Warnings: vague/task-like/implementation-specific/domain-concept-name collision.

### Workflow

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `description` | yes | Operational sequence summary |
| `sequenceNotes` | yes | Step/sequence notes (may combine with description if structured as multi-line) |
| `objectives` | ≥1 Objective ref | |
| `primaryActors` | ≥1 Actor ref with role Primary | |
| `capabilities` | ≥1 Capability ref | |
| `stories` | ≥1 Story ref | |
| `expectedResults` | explicit or derivable | From capabilities |
| `domainConcepts` | explicit or derivable | From capability concept links |

### Story

| Field | Required (Active) | Notes |
|-------|-------------------|-------|
| `actor` | exactly 1 Actor ref | |
| `capability` | exactly 1 Capability ref | |
| `expectedResult` | exactly 1 ExpectedResult ref | |
| `workflows` | ≥1 Workflow ref | |
| `text` | stored or generated | See story derivation |

**Story text resolution**:
1. If `text` present → use stored text.
2. Else if links complete → generated text from template.
3. Else → missing (Draft warns, Active fails).

Template: `As a {Actor}, I can {Capability} so that {Expected Result}.`

Duplicate Active triple `(actorId, capabilityId, expectedResultId)` → validation **failure**.

## Reference object shape

```yaml
- id: actor-coach
  role: Primary   # optional; required where Primary Actor rules apply
```

Broken refs (unknown ID) → **failure** regardless of status.

## Graph project layout

```text
my-product-graph/
├── graph.yaml                 # optional metadata
├── objectives.yaml
├── actors.yaml
├── personas.yaml
├── domain-concepts.yaml
├── capabilities.yaml
├── capability-concept-links.yaml
├── expected-results.yaml
├── workflows.yaml
└── stories.yaml
```

Each `*.yaml` file contains a top-level `primitives` array for that type (exact key documented in fixture contract).

Missing type file → empty collection.

## In-memory structures

```text
ProductGraph
├── metadata: GraphMetadata | null
├── nodes: Map<PrimitiveId, PrimitiveRecord>
├── byType: Map<PrimitiveType, Set<PrimitiveId>>
└── edges: EdgeIndex (typed adjacency)

ValidationResult
├── failures: ValidationFinding[]
├── warnings: ValidationFinding[]
└── summary: { failureCount, warningCount, passed: boolean }

IntegrityReport
├── failures: IntegrityFinding[]
├── warnings: IntegrityFinding[]
└── duplicateStoryTriples: StoryTripleConflict[]

ProductSummary
├── markdown: string
├── sections: SummarySection[]
└── gaps: GapFinding[]
```

## Status-aware rule evaluation

| Condition | Draft | Active | Deprecated |
|-----------|-------|--------|------------|
| Missing required field | warning | failure | ignored unless referenced by Active |
| Missing required relationship | warning | failure | ignored unless referenced by Active |
| Broken reference | failure | failure | failure if referenced |
| Duplicate ID | failure | failure | failure |
| Duplicate Active story triple | failure | failure | n/a |
| Advisory quality heuristics | warning | warning | ignored |

## Tagged errors (Effect)

| Error | When |
|-------|------|
| `FixtureDecodeError` | YAML/Schema decode failure with path |
| `GraphProjectNotFoundError` | Missing project directory |
| `DuplicateIdError` | Duplicate primitive IDs |
| `BrokenReferenceError` | Unknown target ID |
| `ValidationFailedError` | Active failures present (CLI exit code) |
| `OutputWriteError` | `--out` directory not writable |

## Future split boundary

Modules under `packages/cli/src/domain`, `graph`, `validation`, and `summary` are the extraction surface for a future `@specable/domain` package. No CLI or Node platform imports inside `domain` schemas besides Effect core/Schema.
