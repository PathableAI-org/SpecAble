# Readable semantic wiki

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Establish the **semantic document model** — the canonical, human-editable
representation of product knowledge that every storage adapter must satisfy.
By the end of this milestone, SpecAble has a clear contract for what makes a
document a semantic node, how metadata and body divide responsibility, how
relationships are expressed, which identities and provenance must survive
round-trip, and what “readable yet machine-processable” means — without
committing to a specific file format or parser.

This slice bridges completed primitive create/inspect work and the structured
product wiki that later milestones interpret, validate, project, and expose.

## Why this matters

Milestones 1 and 2 proved that product primitives persist as structured data
in local project roots. Alpha’s thesis is stronger: **product knowledge should
live in documents humans can read and edit directly**, with formal semantics
SpecAble can interpret.

Without a defined semantic document model, every adapter (Markdown, Org,
Notion, JSON, SQLite) would invent its own shape and leak presentation concerns
into the ontology. A shared contract keeps the existing product primitive
ontology authoritative while making the wiki the primary authoring surface and
the graph a derived interpretation — not a parallel artifact authors must
maintain.

## Semantic document model

The following is the **conceptual contract** this milestone ratifies. Later
milestones implement adapters, graph derivation, validation, and MCP exposure
against this model. No serialization syntax is prescribed here.

### Semantic node

A **semantic document** represents exactly one product primitive from the
existing ontology (Objective, Actor, Persona, Domain Concept, Capability,
Expected Result, Workflow, Story, and related types). The document is the
durable, human-facing unit of product knowledge; it is not a new primitive
type.

A document is a semantic node when SpecAble can:

- identify which primitive type it represents;
- recover stable primitive identity across reads, edits, and adapter changes;
- separate machine-interpretable structure from human-authored explanation;
- participate in typed relationships with other semantic documents by stable
  identity; and
- preserve provenance needed for traceability.

### Structured metadata

**Metadata** carries formal semantics SpecAble needs to interpret the document
without inferring meaning from prose alone. It belongs outside the narrative
body and maps to the existing primitive schemas from `@specable/domain`.

Metadata SHOULD include, at minimum:

- **stable primitive identity** — durable across storage backends and edits;
- **primitive type** — which ontology type the document represents;
- **display name** — the human-facing title or label;
- **lifecycle status** — `Draft`, `Active`, or `Deprecated` per domain rules;
- **type-specific formal fields** — required and optional semantic properties
  defined by the primitive type (not free-form tags invented by the adapter).

Metadata MUST NOT embed adapter-specific identifiers (file paths, database
row keys, Notion page IDs) as the canonical primitive identity. Adapters MAY
store such references for sync or indexing, but they are not the semantic ID.

### Document body

The **body** is human-authored prose that explains intent, context, rationale,
and nuance — the material a product owner would write for another human. It
supplements structured metadata; it does not replace typed fields that belong
in metadata.

The body:

- MAY include headings, lists, and formatting natural to the authoring medium;
- MUST remain interpretable by humans without running SpecAble;
- MUST NOT be the sole carrier of required formal semantics (type, status,
  identity, mandatory relationships, or type-specific required fields);
- SHOULD stay aligned with the primitive it represents so validation and
  projection can cite both structure and explanation.

### Relationships

**Relationships** connect semantic documents by **stable primitive identity** and
**relationship kind** from the canonical product primitive ontology (for
example, story→actor, story→capability, capability→workflow).

Conceptually:

- A relationship references **source** and **target** primitive identities, not
  adapter-local names or file paths.
- The relationship **kind** is explicit and typed; it is not inferred only from
  hyperlink text or document proximity.
- Relationships MAY be authored inline with a document, collected in a
  companion structure, or expressed through conventions defined by a backend —
  but every backend MUST map to the same semantic edge: `(source id, kind,
  target id)`.
- Removing or editing a relationship MUST NOT silently reassign primitive
  identity.

The [semantic interpretation layer](semantic-interpretation-layer.md) in the
next milestone defines how SpecAble understands these relationships as explicit,
traceable edges derived from wiki content.

### Stable identity

The following MUST have **stable, adapter-independent identity**:

- each product primitive (semantic document);
- each typed relationship edge (identified by source, kind, and target, or an
  equivalent stable edge identity defined at the domain boundary);
- provenance records that trace derived artifacts back to source primitives.

Identity MUST survive:

- round-trip through a storage adapter;
- human edits to body prose and non-identity metadata fields;
- projection to JSON or SQLite representations used as proving adapters.

Identity MUST NOT depend on display name, file name, or storage location.

### Provenance

**Provenance** preserves where product knowledge came from and how it evolved,
supporting traceability without inventing meaning.

The model MUST support, where available:

- **source references** — pointers to external evidence (research, decisions,
  interviews, tickets) that informed the primitive;
- **authorship and change context** — who or what last shaped the knowledge,
  when material facts changed, and whether content is observed vs asserted;
- **derivation lineage** — which primitives contributed to generated outputs
  (PRD sections, validation findings, summaries).

Provenance is structured metadata or linked records — not prose buried only in
the body. When source information is missing, later stages report the gap
rather than fabricating provenance.

### Human-readable and machine-processable

A semantic document is **human-readable** when a product owner can open it in
ordinary editing tools, understand the product intent, and revise prose without
specialized SpecAble knowledge.

It is **machine-processable** when SpecAble can:

- decode metadata into typed primitive values at the domain boundary;
- list and filter primitives without NLP on the body;
- resolve relationships by stable ID;
- detect schema violations and missing required fields with actionable errors;
- derive graph, validation, and projection artifacts from the same semantic
  content.

Readability and processability are joint requirements: neither unstructured
prose alone nor opaque structured stores satisfy the wiki thesis.

## Architectural placement

```text
Human-editable semantic documents (wiki)
        │
        ▼  interpret
Semantic graph (primitives + typed relationships)
        │
        ▼  derive
Validation · PRD projection · MCP resources
```

- **Wiki** — primary editable representation of product knowledge.
- **Graph** — semantic interpretation of wiki content, not a separately
  authored parallel source of truth.
- **Adapters** — Markdown, Org, Notion, Confluence, JSON, SQLite, and future
  formats are interchangeable storage and presentation implementations over the
  same semantic document model.
- **JSON and SQLite** (milestones 1–2) — remain useful as local proving
  adapters and illustrative mappings; they are not the defining authoring
  experience for alpha.

## Demo

Conceptual walkthrough with **synthetic** product knowledge only:

1. Start from example primitives aligned with milestone 2 (Capability, Actor,
   Story, or similar) — drawn from existing JSON or SQLite fixtures or
   equivalent acceptance examples.
2. Show how each primitive **maps** to a semantic document under the model:
   identity and type in metadata, formal fields separated from explanatory
   body, relationships referencing other primitives by stable ID, provenance
   attached where applicable.
3. Present a human-readable example document and confirm a reviewer can
   understand product intent **without SpecAble**.
4. Walk through how the model would be **interpreted** into typed primitives at
   the domain boundary — illustrating recoverability of required semantics
   without running an adapter or parser.
5. Sketch a second representation perspective (for example, structured storage
   vs human-readable prose) expressing the **same semantic contract** —
   proving the model is adapter-agnostic.

This demo ratifies the conceptual model. CLI commands, parsers, and executable
round-trip belong in later milestones.

## Expected result

- The semantic document model is documented and ratified as the alpha wiki
  contract.
- Every core alpha primitive type has a defined mapping: metadata fields, body
  role, relationship participation, identity rules, and provenance expectations.
- Milestone 2 primitives can be **represented** by the model without losing
  typed semantics or stable IDs in principle.
- Reviewers agree the model is sufficient for later milestones to derive a
  graph, run validation, project a PRD, and expose MCP resources — without
  revisiting ontology boundaries.

## User-visible or agent-visible behavior

- Authors work with **readable semantic documents** as the primary mental model
  for product knowledge, not opaque graph records.
- Each document clearly represents one typed primitive with separable metadata
  and body.
- Relationships are understandable as connections between known primitives,
  not adapter implementation details.
- Errors reference semantic fields and primitive identity, not parser internals.
- Future agents consume the same interpreted primitives whether the backing
  store is a wiki page, JSON fixture, or SQLite index.

## Acceptance criteria

- [ ] The semantic document model answers: what makes a document a semantic
  node; what belongs in metadata vs body; how relationships are represented; what
  must have stable identity; what provenance is preserved; and what makes
  documents human-readable yet machine-processable.
- [ ] Product knowledge can be **authored** as human-readable semantic
  documents that encode existing product primitive types — not a new wiki-only
  primitive layer.
- [ ] Documents carry **sufficient formal structure** for SpecAble to interpret
  them into typed primitives at the domain boundary without prose-only
  inference for required fields.
- [ ] The representation is **local-first** and **tool-agnostic**: documents
  remain meaningful in ordinary editors without network services or
  vendor-specific runtimes.
- [ ] **Contract examples or acceptance fixtures** show at least two
  representation perspectives (for example, structured storage plus
  human-readable prose) satisfying the **same semantic contract** without
  adapter-specific concepts in the ontology.
- [ ] The model's identity and recoverability requirements preserve stable
  primitive identity, type, status, required formal fields, typed
  relationships, and available provenance when representations change.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- Semantic document model definition and alpha wiki contract
- Mapping from existing product primitive types to document structure
  (metadata, body, relationships, provenance)
- Identity and recoverability requirements the contract imposes on any adapter
- Contract examples or acceptance fixtures showing milestone 2 primitives can
  be represented by the model
- Reference mappings or example document models per primitive type
- Documentation preparing Notion, Confluence, and additional readable backends
  as future adapters over the same contract

## Out of scope

- Choosing or specifying Markdown vs Org vs other concrete syntax
- Frontmatter keys, property drawers, parser algorithms, or file layout
- Reference adapter or parser implementation
- Automated contract or parity tests (later milestones prove executable
  round-trip)
- CLI commands that read or write wiki documents
- Semantic interpretation layer definition (next milestone:
  [semantic-interpretation-layer.md](semantic-interpretation-layer.md))
- Validation rules and PRD readiness checks
- PRD projection templates
- MCP resources and tools
- Notion or Confluence production adapters
- Introducing new ontology primitives unless a gap in the existing model is
  proven necessary

## Dependencies

- [Create and inspect primitives](create-inspect-primitives.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Formalize the **semantic document model** as the alpha wiki contract: specify
how each supported product primitive type maps to a semantic document (metadata,
body, relationships, identity, provenance), define interpretation and
recoverability requirements at the domain boundary, and deliver reference
mappings or example document models plus contract examples or acceptance
fixtures demonstrating that milestone 2 primitives can be represented by the
model. Prepare for additional readable backends without prescribing their
syntax or building parsers in this milestone.

### Users / actors

- Product owners and engineers authoring product knowledge as readable semantic
  documents
- Maintainers defining adapter contracts before graph, validation, and MCP
  milestones
- Future AI clients consuming interpreted primitives regardless of storage form

### Required behavior

- Each semantic document represents exactly one product primitive with stable
  identity, explicit type, display name, lifecycle status, and type-specific
  formal fields in structured metadata
- Body prose explains intent and context; required semantics are not body-only
- Typed relationships reference other primitives by stable ID and explicit
  relationship kind from the canonical ontology
- Provenance and source references attach where available; gaps are detectable
  later, not silently invented
- The model must allow recovery of milestone 2 primitive semantics (identity,
  type, status, required fields) at the domain boundary without prose-only
  inference for required fields
- A human can read and understand example documents without SpecAble; the
  contract defines how SpecAble would interpret required semantics without NLP
  on the body
- JSON and SQLite adapters remain valid proving implementations; the semantic
  contract does not inherit storage-format-specific concepts

### Constraints

- Extend the existing primitive ontology — the wiki is a representation, not a
  new primitive type
- Local-first; synthetic fixtures only in demos and contract examples
- Adapter-based: core semantics stay in domain schemas; parsers live at adapter
  boundaries only
- Traceability: provenance and stable IDs support later projection and
  validation
- No concrete wiki syntax or parser design in this milestone — those are
  implementation decisions for later milestones unless the spec explicitly
  records open choices as decisions to make, not decisions made

### Non-goals

- Reference adapter, parser, or CLI wiki read/write implementation
- Automated contract or parity tests
- Defining the semantic interpretation layer (next milestone)
- Active-status validation and PRD readiness rules
- MCP exposure
- External tool sync (Notion, Confluence, Jira, etc.)
- Destructive lifecycle operations beyond what milestone 2 already provides

### Success definition

The semantic document model is ratified, contract examples or acceptance
fixtures demonstrate that milestone 2 primitives can be represented without
semantic loss, and reviewers confirm the model is ready for semantic
interpretation and adapter implementation in later milestones.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/3
- Prior milestone (superseded): [link-primitive-graph.md](link-primitive-graph.md)
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/91 (pivot),
  https://github.com/PathableAI-org/SpecAble/issues/69 (setup — to be revised)

## Risks or blockers

- Tension between keeping the spec format-agnostic and wanting executable proof
  — mitigate by separating contract ratification (this milestone) from adapter
  implementation and automated parity tests (later milestones)
- Product Decision, Product Risk, and Evidence boundary (core primitive vs
  operating metadata) may affect metadata vs provenance split
- Minimum required fields per primitive type must stay aligned with milestone 2
  and future Active-status validation

## Completion evidence

- [ ] Semantic document model section reviewed and accepted as alpha wiki contract
- [ ] Demo walkthrough completed with synthetic data
- [ ] Acceptance criteria satisfied
- [ ] Contract examples or acceptance fixtures demonstrate adapter-agnostic
  semantic parity at the model level
- [ ] Related GitHub issues closed or retargeted for revised scope
