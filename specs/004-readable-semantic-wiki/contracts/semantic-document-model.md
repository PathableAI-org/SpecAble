# Contract: Semantic Document Model

**Feature**: `004-readable-semantic-wiki`  
**Status**: Normative alpha wiki contract  
**Consumers**: Future readable adapters, semantic interpretation layer, validation, MCP

## Purpose

Define what makes a document a **semantic node** in SpecAble's alpha wiki: the format-agnostic contract every storage adapter must satisfy before parsers or CLI wiki commands are implemented.

This contract does **not** prescribe serialization syntax, frontmatter keys, file layout, or parser algorithms.

## Semantic node

A **semantic document** represents exactly one product primitive from the existing ontology:

Objective, Actor, Persona, Domain Concept, Capability, Expected Result, Workflow, Story.

It is **not** a new wiki-only primitive type.

A document is a semantic node when SpecAble can:

1. **Identify** which primitive type it represents
2. **Recover** stable primitive identity across reads, edits, and adapter changes
3. **Separate** machine-interpretable structure from human-authored explanation
4. **Participate** in typed relationships with other semantic documents by stable identity
5. **Preserve** provenance needed for traceability

## Document structure

Every semantic document has two parts:

| Part | Responsibility |
|------|----------------|
| **Structured metadata** | Formal semantics SpecAble needs without inferring from prose alone |
| **Document body** | Human-authored explanation of intent, context, and rationale |

### Metadata requirements

Metadata MUST include at minimum:

- **stable primitive identity** (`id`) — durable across storage backends and edits
- **primitive type** (`type`) — ontology discriminator
- **display name** (`name`) — human-facing title
- **lifecycle status** (`status`) — `Draft`, `Active`, or `Deprecated`
- **type-specific formal fields** — required and optional semantic properties defined by the primitive type

Metadata MUST map to the existing product primitive schemas at the domain boundary.

Metadata MUST NOT embed adapter-specific identifiers (file paths, database row keys, Notion page IDs) as canonical primitive identity. Adapters MAY store such references for sync or indexing under non-canonical fields.

### Body requirements

The body:

- MAY include headings, lists, and formatting natural to the authoring medium
- MUST remain interpretable by humans without running SpecAble
- MUST NOT be the sole carrier of required formal semantics (type, status, identity, mandatory relationships, or type-specific required fields)
- SHOULD stay aligned with the primitive it represents

## Relationships

Relationships connect semantic documents by **stable primitive identity** and **relationship kind** from the canonical ontology.

### Semantic edge tuple

Every relationship normalizes to:

```text
(sourceId, relationshipKind, targetId)
```

- `sourceId` — stable ID of the document being interpreted
- `relationshipKind` — ontology field name (e.g., `Story.actor`, `Capability.expectedResults`)
- `targetId` — stable ID of the referenced primitive

### Rules

- References use stable primitive IDs, not display names, file paths, or adapter-local names
- Relationship kind is explicit and typed; it is not inferred only from hyperlink text or document proximity
- Relationships MAY be authored inline with a document, collected in a companion structure, or expressed through backend conventions — but every backend MUST map to the same semantic edge tuple
- Removing or editing a relationship MUST NOT silently reassign primitive identity

## Stable identity

The following MUST have stable, adapter-independent identity:

- each product primitive (semantic document)
- each typed relationship edge (source, kind, target)
- provenance records tracing derived artifacts to source primitives

Identity MUST survive:

- round-trip through a storage adapter
- human edits to body prose and non-identity metadata fields
- projection to structured storage representations used as proving adapters

Identity MUST NOT depend on display name, file name, or storage location.

## Provenance

Provenance preserves where product knowledge came from and how it evolved.

The model MUST support, where available:

- **source references** — pointers to external evidence (research, decisions, interviews, tickets)
- **authorship and change context** — who or what last shaped the knowledge, when material facts changed, asserted vs observed
- **derivation lineage** — which primitives contributed to generated outputs

Provenance is structured metadata or linked records — not prose buried only in the body. When source information is missing, later stages report the gap rather than fabricating provenance.

## Human-readable and machine-processable

### Human-readable

A product owner can open the document in ordinary editing tools, understand product intent, and revise prose without specialized SpecAble knowledge.

### Machine-processable

SpecAble can:

- decode metadata into typed primitive values at the domain boundary
- list and filter primitives without NLP on the body
- resolve relationships by stable ID
- detect schema violations and missing required fields with actionable errors referencing semantic fields and primitive identity
- derive graph, validation, and projection artifacts from the same semantic content

Readability and processability are **joint requirements**.

## Non-conformance

| Violation | Consequence |
|-----------|-------------|
| Required semantics encoded body-only | Non-conformant document |
| Canonical ID is adapter-local | Non-conformant document |
| Required relationship inferred from prose only | Non-conformant for required edges |
| Identity reassigned on rename/move | Contract violation |

## Out of scope (this contract)

- Concrete wiki syntax (Markdown, Org, Notion properties)
- Parser algorithms and file layout
- Interpretation service implementation
- Automated parity tests
- Active-status validation rules

## Related artifacts

- [reference-mappings.md](./reference-mappings.md) — per-type field and relationship maps
- [representation-perspectives.md](./representation-perspectives.md) — structured storage vs human-readable prose
- [examples/](./examples/) — contract fixtures
- [data-model.md](../data-model.md) — entity reference
