# Data Model: Readable Semantic Wiki

**Feature**: `004-readable-semantic-wiki`  
**Date**: 2026-06-28

## Package boundaries

| Concern | Package | Location | This milestone |
|---------|---------|----------|----------------|
| Product primitive schemas | `@specable/domain` | `packages/domain/src/primitives/` | **Referenced** — unchanged |
| Structured storage (perspective A) | `@specable/core` | `packages/core/src/storage/` | **Referenced** — proving adapter |
| Semantic document contract | Spec Kit | `specs/004-readable-semantic-wiki/contracts/` | **Delivered** |
| Interpretation services | TBD | Next milestone | **Deferred** |

## Architectural placement

```text
Human-editable semantic documents (wiki)     ← THIS MILESTONE (contract)
        │
        ▼  interpret                            ← NEXT MILESTONE
Semantic graph (primitives + typed edges)
        │
        ▼  derive
Validation · PRD projection · MCP resources
```

The wiki is the **primary editable representation**; the graph is a **derived interpretation**, not a separately authored parallel source of truth.

## Core entities

### Semantic Document

The durable, human-facing unit of product knowledge. Represents **exactly one** product primitive.

| Part | Role | Required |
|------|------|----------|
| Structured metadata | Formal semantics for machine interpretation | yes |
| Document body | Human-authored explanation | yes (MAY be minimal at Draft) |

**Semantic node criteria** — SpecAble can:

1. Identify primitive type from metadata
2. Recover stable identity across reads, edits, and adapter changes
3. Separate machine structure from human prose
4. Participate in typed relationships by stable ID
5. Preserve provenance for traceability

### Structured Metadata

Maps to domain `Primitive` Schema fields. MUST NOT use adapter-local identifiers as canonical `id`.

#### Universal metadata fields (all types)

| Field | Domain source | Required | Notes |
|-------|---------------|----------|-------|
| `id` | `PrimitiveBase.id` | yes | Stable, adapter-independent |
| `type` | per-type literal | yes | Discriminator |
| `name` | `PrimitiveBase.name` | yes | Display name |
| `status` | `PrimitiveBase.status` | yes | `Draft` \| `Active` \| `Deprecated` |
| `description` | `PrimitiveBase.description` | no | MAY expand in body |
| `evidence` | `PrimitiveBase.evidence` | no | Source reference (provenance) |
| `notes` | `PrimitiveBase.notes` | no | Supplementary |
| `tags` | `PrimitiveBase.tags` | no | Not relationship edges |
| `confidence` | `PrimitiveBase.confidence` | no | Primarily Persona |

#### Type-specific metadata fields

See [reference-mappings.md](./contracts/reference-mappings.md) for full per-type tables.

### Document Body

| Rule | Enforcement |
|------|-------------|
| Human-readable without SpecAble | Reviewer quickstart |
| MUST NOT be sole carrier of required semantics | Contract + non-conformance definition |
| MAY include headings, lists, formatting natural to medium | Adapter-defined later |
| SHOULD align with represented primitive | Reviewer guidance |

**Body-appropriate content**: expanded rationale, stakeholder context, sequence narration (`Workflow.sequenceNotes` expansion), story narrative beyond `Story.text`, persona goals elaboration.

**Metadata-appropriate content**: all required formal fields, relationship references, lifecycle status, provenance records.

### Semantic Relationship Edge

Normalized tuple independent of authoring style:

| Component | Type | Notes |
|-----------|------|-------|
| `sourceId` | PrimitiveId | Document being interpreted |
| `relationshipKind` | ontology field name | e.g., `Story.actor`, `Capability.actors` |
| `targetId` | PrimitiveId | Referenced primitive |

Reference fields in domain Schemas encode edges:

| Pattern | Example field | Edge kind |
|---------|---------------|-----------|
| Single reference | `Story.actor` | Story → Actor |
| Reference array | `Capability.expectedResults` | Capability → ExpectedResult (each element) |
| Reference with role | `Persona.primaryActors[]` | Persona → Actor (with role metadata) |

**Invariants**:

- Edges reference stable IDs, not display names or file paths
- Editing/removing an edge MUST NOT change source or target identity
- Body hyperlinks alone do NOT constitute typed edges

### Stable Primitive Identity

| MUST survive | MUST NOT depend on |
|--------------|-------------------|
| Round-trip through adapters | Display name |
| Body prose edits | File name |
| Non-identity metadata edits | Storage location |
| Projection to structured storage | Adapter-local IDs |

### Provenance Record

Structured metadata (or linked records), not body-only prose.

| Category | Contract fields | Domain mapping today |
|----------|-----------------|---------------------|
| Source references | `evidence`, optional `sources[]` | `evidence` |
| Authorship / change context | optional `authorship` block | extension (interpretation layer) |
| Derivation lineage | optional `derivedFrom[]` | extension (projection milestones) |

**Gap behavior**: Missing provenance is valid; later stages report gaps, never fabricate.

## Per-type summary

| Type | Key metadata fields (beyond base) | Primary relationships | Body role |
|------|-----------------------------------|----------------------|-----------|
| Objective | `successCriteria` | `expectedResults[]`, `workflows[]` | Why this objective matters |
| Actor | `category` | (referenced by others) | Role in product behavior |
| Persona | `goalsOrPainPoints`, `confidence` | `primaryActors[]` | Research-backed context |
| DomainConcept | `definition` | (referenced by capabilities/workflows) | Usage examples in domain |
| Capability | — | `actors[]`, `domainConcepts[]`, `expectedResults[]`, `workflows[]` | Operational detail |
| ExpectedResult | `definition` | `capabilities[]`, `objectives[]` | Observable outcome narrative |
| Workflow | `sequenceNotes` | `objectives[]`, `primaryActors[]`, `capabilities[]`, `domainConcepts[]`, `expectedResults[]`, `stories[]` | Step-by-step flow |
| Story | `text` | `actor`, `capability`, `expectedResult`, `workflows[]` | User-facing story context |

Full field tables: [reference-mappings.md](./contracts/reference-mappings.md).

## Representation perspectives

### Perspective A — Structured storage

Milestone 2 JSON primitive record: a single object matching domain Schema. Metadata and body fields coexist in one structured object (`description`, `definition`, `text`, `sequenceNotes` are structured string fields, not separate body document).

This perspective proves recoverability at the domain boundary; it is **not** the target human authoring experience for alpha.

### Perspective B — Human-readable prose

A document with explicit **Metadata** and **Body** sections using neutral plain-text labels. Metadata content is semantically equivalent to Perspective A fields. Body expands narrative portions.

See [representation-perspectives.md](./contracts/representation-perspectives.md) and [examples/](./contracts/examples/).

## Non-conformance conditions

| Condition | Result |
|-----------|--------|
| Required semantics body-only | Non-conformant |
| Canonical ID is file path or page ID | Non-conformant |
| Relationship inferred only from prose links | Non-conformant for required edges |
| Missing required metadata fields for type | Detectable at interpretation (future) |
| Identity changes on rename/move | Non-conformant |

## State transitions

This milestone defines no runtime state machine. Conceptual document lifecycle:

```text
(draft semantic document) --author edits body--> (same identity, updated prose)
(draft semantic document) --author edits metadata--> (same identity, updated fields)
(any document) --adapter round-trip--> (same identity if contract satisfied)
(non-conformant document) --interpret--> ERROR with semantic field paths (future)
```

## Validation rules (contract-level)

| Rule | When enforced |
|------|---------------|
| Metadata contains `id`, `type`, `name`, `status` | Interpretation (next milestone) |
| `id` is adapter-independent | Contract review + future automated tests |
| Relationship refs use stable IDs | Contract review |
| Required fields not body-only | Contract review |
| Metadata decodes to domain Schema | Interpretation (next milestone) |
| Active-status relationship requirements | Validation milestone (deferred) |

## Relationship to milestone 2 entities

| Milestone 2 entity | Semantic document role |
|--------------------|------------------------|
| Product Primitive | Metadata maps 1:1 to domain Schema |
| Primitive Identifier | Canonical `id` in metadata |
| Canonical Read Projection | Equivalent to decoded metadata for structured-storage perspective |
| Project Root | Out of scope — wiki project layout deferred to adapter milestones |
