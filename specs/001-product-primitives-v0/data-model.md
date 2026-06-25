# Data Model: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Date**: 2026-06-23 (updated 2026-06-25)

## Package boundaries

| Concern | Package | Location |
|---------|---------|----------|
| Primitive schemas, Schema literal unions, references | `@specable/domain` | `packages/domain/src/` |
| `ProductGraph`, loaders, validation, integrity, summary, CLI | `@specable/cli` | `packages/cli/src/` |

## Service boundaries (`@specable/cli`)

| Service | Role | Consumers |
|---------|------|-----------|
| `GraphRepository` | Public load contract: `load(projectPath) → ProductGraph` | Validation, integrity, summary, CLI commands |
| `GraphLoader` | File-backed JSON implementation (internal) | Composed into `GraphRepository` via Layers only |
| `FileSystem` | Platform I/O (Node in v0) | Composed at `services/Layers.ts`; not imported by feature modules |

Storage mechanics (per-type JSON files, paths, `JSON.parse`) MUST NOT leak past `GraphLoader` into validation, integrity, or CLI adapters.

Closed-set fields (`status`, `category`, `role`, `importance`, `confidence`, etc.) are **Schema literal unions** in `@specable/domain` — not native TypeScript `enum`. Field semantics and Schema-supported validation use Effect Schema annotations (FR-058).

Opaque canonical primitive IDs are branded as `PrimitiveId` in `@specable/domain`. Human-authored prose and display strings remain unbranded. Adapter-specific IDs (for example SQL row IDs, Notion page IDs, Confluence page IDs) are adapter-layer concerns and must not leak into domain primitive schemas.

## Overview

A **graph project** is a directory of JSON fixture files representing product primitives and typed references. The in-memory **ProductGraph** indexes primitives by `id` and `type`, materializes reference edges, and feeds validation, integrity analysis, and summary generation.

All primitives share common metadata:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `PrimitiveId` (branded string) | yes | Stable, globally unique within project; raw fixture strings decode into branded IDs |
| `name` | string | yes | Display name for summaries and story template |
| `status` | `Draft` \| `Active` \| `Deprecated` (Schema literal union) | yes | Controls validation strictness |
| `description` | string | conditional | Required per-type rules below |

Optional cross-cutting fields (when applicable): `notes`, `tags`, `evidence`, `confidence`.

## Relationship semantics and storage adapters

Canonical relationships are modeled by primitive fields, not by separate graph metadata:

- `Capability.actors` references Actor primitives.
- `Workflow.capabilities` references Capability primitives.
- `Story.actor`, `Story.capability`, and `Story.expectedResult` form the story triple.

The physical representation of those links is storage-specific. JSON fixtures use primitive ID references, SQL may use foreign keys or join tables, Notion may use relation properties, and Confluence may use page links. Each adapter translates its storage-specific links into the canonical primitive fields before validation, integrity analysis, summaries, or MCP/query surfaces consume the model.

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

```json
{ "id": "actor-coach", "role": "Primary" }
```

Or string ID shorthand: `"actor-coach"`.

Reference `id` values are canonical `PrimitiveId` values after Schema decode. They are not backend object identifiers.

Broken refs (unknown ID) → **failure** regardless of status (validation-owned).

## Name normalization (integrity)

Duplicate and likely-duplicate detection compare **normalized** display names within a primitive type:

1. `trim()` leading/trailing whitespace
2. `toLowerCase()` on the full string
3. Internal spacing and punctuation **preserved** (no collapse)

Likely duplicates: Jaccard similarity ≥ 0.8 on whitespace-split word tokens after normalization.

## Orphan detection (integrity)

A primitive is an **orphan** when:

1. Zero inbound **and** zero outbound typed relationship edges, **and**
2. Its type cannot meaningfully stand alone without relationships

**Exclusions**:

- Disconnected **Actors** — never classified as orphans (drafting-friendly)
- **Draft Objectives** standing alone — not orphans (FR-021)

Orphans → integrity **warning** in `integrity-report.json`.

Active missing required relationships → validation **failure** in `validation.json` (not orphans).

## Workflow derivability (integrity)

For Active Workflows, `expectedResults` and `domainConcepts` may be explicit or **derivable** by traversing linked Capabilities:

- Expected Result derivable if any linked Capability references ≥1 Expected Result
- Domain Concept derivable if any linked Capability references ≥1 Domain Concept (direct ref or via Capability Concept Link)

If not explicit and not derivable → integrity warning `missing-workflow-derivation`.

## Artifact ownership

| Finding category | Owner artifact | Severity (typical) |
|------------------|----------------|-------------------|
| Active under-linked, broken refs, duplicate ID, duplicate story triple | `validation.json` | failure |
| Draft incompleteness, per-primitive advisories (FR-013–FR-026) | `validation.json` | warning |
| Orphans, duplicate names, likely duplicates, workflow derivability gaps | `integrity-report.json` | warning |
| `duplicateStoryTriples` summary | `integrity-report.json` | informational (failures in validation) |

`summary.md` **Known Modeling Gaps** references both sources without duplicating full finding objects (FR-039).

## Graph project layout

```text
my-product-graph/
├── graph.json                 # optional metadata
├── objectives.json
├── actors.json
├── personas.json
├── domain-concepts.json
├── capabilities.json
├── capability-concept-links.json
├── expected-results.json
├── workflows.json
└── stories.json
```

Each `*.json` file contains a top-level `primitives` array for that type (exact key documented in fixture contract).

Missing type file → empty collection.

## In-memory structures

*`ProductGraph` and downstream report types live in `@specable/cli`; primitive decoded types come from `@specable/domain`.*

```text
ProductGraph
├── metadata: Option<GraphMetadata>
├── nodes: Map<PrimitiveId, PrimitiveRecord>
├── byType: Map<PrimitiveType, Set<PrimitiveId>>
└── edges: EdgeIndex (typed adjacency)

ValidationResult
├── failures: ValidationFinding[]
├── warnings: ValidationFinding[]
└── summary: { failureCount, warningCount, passed: boolean }

IntegrityReport
├── warnings: IntegrityFinding[]     # integrity-specific heuristics only
└── duplicateStoryTriples: StoryTripleConflict[]   # summary; failures owned by validation

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
| Duplicate normalized name (same type) | warning (integrity) | warning (integrity) | warning (integrity) |
| Likely duplicate name (Jaccard ≥ 0.8) | warning (integrity) | warning (integrity) | warning (integrity) |
| Orphan (zero-edge, type cannot stand alone) | warning (integrity) | warning (integrity) | ignored |
| Workflow derivability gap | warning (integrity) | warning (integrity) | ignored |
| Advisory quality heuristics | warning (validation) | warning (validation) | ignored |

Duplicate normalized names are integrity **warnings** only (FR-034a); they do not alone cause CLI exit code `1`.

## CLI exit semantics

| Exit code | Condition |
|-----------|-----------|
| `0` | No Active validation failures and no broken references |
| `1` | One or more Active validation failures or broken references |
| `2` | Usage error, missing project directory, or JSON/schema decode failure |

Integrity warnings alone never fail exit (FR-060).

## Tagged errors (Effect)

**`@specable/domain`**

| Error | When |
|-------|------|
| `FixtureDecodeError` | JSON/Schema decode failure with path |

**`@specable/cli`**

| Error | When |
|-------|------|
| `GraphProjectNotFoundError` | Missing project directory |
| `DuplicateIdError` | Duplicate primitive IDs at load/index |
| `BrokenReferenceError` | Unknown target ID (validation) |
| `ValidationFailedError` | Active failures present (CLI exit code `1`) |
| `OutputWriteError` | `--out` directory not writable |

## Schema module boundary

`@specable/domain` MUST NOT import `@specable/cli`, Node platform modules, or fixture parsers beyond Schema decode of already-parsed JSON values. Only Effect core/Schema and domain-local types. Cross-primitive graph rules, status-aware severity, and integrity heuristics are implemented in `@specable/cli` consuming decoded domain types.
