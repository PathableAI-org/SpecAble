# Semantic interpretation layer

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Establish the **semantic interpretation layer** — the conceptual contract for
how SpecAble understands human-authored semantic documents and derives a
coherent internal model of product knowledge. By the end of this milestone,
SpecAble has a clear definition of what it means to interpret wiki content
into typed concepts, typed relationships, provenance, traceability signals,
validation inputs, and derived views — without prescribing parsers, storage
technologies, serialization formats, or graph-authoring workflows.

This slice bridges the ratified semantic document model (milestone 3) and the
reasoning milestones that follow: validation, PRD projection, and MCP exposure.

## Why this matters

Milestone 3 defined what a semantic document is and what every adapter must
preserve. Alpha’s thesis depends on a stronger step: **SpecAble must know what
it means to understand those documents** as product knowledge — not merely to
parse or store them.

Without a defined interpretation layer, later work risks collapsing into
graph construction, adapter-specific edge types, or a parallel editable graph
that competes with the wiki. A shared interpretation contract keeps the wiki
as the sole editable source of truth while making relationships explicit,
provenance traceable, and downstream validation and projection possible from
the same derived model.

## Semantic interpretation model

The following is the **conceptual contract** this milestone ratifies. Later
milestones implement adapters, interpreters, validation engines, and MCP
exposure against this model. No parser algorithms, database schemas, or graph
storage technologies are prescribed here.

### Interpretation boundary

**Interpretation** is the act of reading semantic documents and producing a
**semantic product knowledge model** — a derived, read-only view of what
SpecAble understands about the product at a point in time.

```text
Human-editable semantic documents (wiki)
        │
        ▼  interpret
Semantic product knowledge model
  (typed concepts · relationships · provenance · gaps · derivable views)
        │
        ▼  consume
Validation · PRD projection · MCP resources · future roadmap/slice views
```

- **Input:** one or more semantic documents satisfying the milestone 3 contract.
- **Output:** a coherent interpreted model SpecAble can reason over.
- **Non-goal:** authors never edit the interpreted model directly; they edit
  documents, and SpecAble re-derives the model.

### Interpreted concept

An **interpreted concept** is a typed product primitive recovered from a
semantic document at the domain boundary:

- maps to exactly one ontology primitive type from `@specable/domain`;
- carries stable primitive identity from the source document;
- includes lifecycle status and type-specific formal fields decoded from
  structured metadata;
- retains a link to the **source document** that asserted the concept;
- distinguishes **asserted** semantics (explicit in metadata) from **body
  context** (explanatory prose that may inform human review but does not
  substitute for required formal fields).

Interpretation MUST NOT invent concepts that have no supporting semantic
document. Ambiguous or incomplete documents produce interpretation gaps
(see below), not silent defaults.

### Interpreted relationship

An **interpreted relationship** is an explicit, typed edge in the semantic
product knowledge model:

- **source** and **target** are stable primitive identities from interpreted
  concepts;
- **kind** is an explicit relationship type from the canonical product
  primitive ontology — not inferred solely from hyperlinks, proximity, or
  display names;
- **provenance** records which source document(s) asserted the edge;
- **direction and cardinality expectations** follow domain rules for the
  relationship kind (for example, story→actor, capability→workflow).

Relationships become first-class in the interpreted model even when a storage
adapter physically embeds them in page metadata or inline conventions. Every
adapter path MUST normalize to the same semantic edge:
`(source id, kind, target id)` plus provenance.

Broken references (unknown target ID, invalid relationship kind, missing
source concept) are **interpretation findings**, not silent omissions.

### Evidence and provenance

**Evidence** is structured support for why an interpreted concept or
relationship is believed to hold:

- **source references** attached to primitives (research, decisions,
  interviews, tickets) preserved from document metadata or linked records;
- **document lineage** — which semantic document asserted each concept and
  edge;
- **authorship and change context** when available (who shaped the knowledge,
  observed vs asserted status);
- **derivation lineage placeholders** — slots for later milestones to record
  which primitives contributed to generated outputs.

Provenance in the interpreted model MUST remain traceable back to wiki
documents. When evidence is missing, interpretation records the gap rather
than fabricating support.

### Interpretation gaps

**Interpretation gaps** are explicit records of product knowledge SpecAble
cannot yet recover from available documents:

- documents that fail required metadata or type constraints at the domain
  boundary;
- relationships pointing to unknown or ambiguous primitive identities;
- required formal fields absent from structured metadata;
- relationship kinds outside the canonical ontology;
- provenance or evidence fields declared but empty where later validation
  will require them;
- duplicate identity collisions across documents.

Gaps are part of the interpreted model. They tell humans and agents what is
**still missing** before PRD readiness validation or projection can treat the
knowledge as complete. Interpretation reports gaps; it does not auto-repair
documents.

### Derivable views

From a coherent interpreted model, SpecAble can derive **views** — stable
projections consumed by later milestones without becoming new sources of
truth:

- **concept catalog** — typed primitives with identity, status, and formal
  fields;
- **relationship index** — traversable typed edges with provenance;
- **traceability map** — concept and edge → source document → external
  evidence;
- **gap report** — interpretation findings blocking completeness;
- **validation inputs** — structured facts validation rules will consume
  (status, required relationships, referential integrity) without running
  those rules in this milestone;
- **projection inputs** — structured product knowledge PRD generation and
  summaries can cite, including which primitives support which narrative
  sections.

Derivable views are outputs of interpretation, not editable artifacts. They
exist so validation, PRD projection, MCP resources, and future roadmap or
slice generation can share one derived semantic foundation.

### Semantic product knowledge model

The **semantic product knowledge model** is the conceptual whole formed by
interpreted concepts, interpreted relationships, provenance, interpretation
gaps, and derivable views over a set of semantic documents.

It is:

- **derived** — always recomputed from current wiki content;
- **typed** — grounded in the existing primitive ontology;
- **traceable** — every asserted concept and edge links to source documents
  and available evidence;
- **adapter-independent** — the same model whether documents arrived via
  Markdown, Org, Notion, JSON, SQLite, or future backends;
- **not a competing wiki** — no graph-authoring workflow; no direct node
  editing.

It is NOT:

- a property graph, RDF graph, or other implementation-specific technology;
- a separately persisted artifact authors maintain in parallel with documents;
- a new ontology layer or primitive type system.

JSON and SQLite representations from milestones 1–2 remain valid **adapter
paths** whose normalized interpretation MUST converge on the same semantic
product knowledge model as readable wiki documents.

## What interpretation answers

After reading semantic documents, SpecAble MUST be able to determine:

| Question | Interpretation output |
| --- | --- |
| Which semantic concepts exist? | Interpreted concepts keyed by stable primitive identity and type |
| Which relationships exist? | Interpreted relationships with explicit kind and endpoints |
| What evidence supports those concepts? | Provenance and source references linked to concepts and edges |
| What product knowledge is still missing? | Interpretation gaps with stable finding identity |
| What artifacts can now be derived? | Derivable views ready for validation, projection, and agent access |

This milestone defines **what understanding means**. It does not implement
graph construction commands, storage engines, or validation rule execution.

## Architectural placement

```text
Milestone 3: semantic document model (what authors write)
        │
        ▼
Milestone 4: semantic interpretation layer (what SpecAble understands)  ← this milestone
        │
        ▼
Later: validation · PRD projection · MCP · roadmap/slice views
```

- **Wiki** — canonical editable representation; humans edit documents only.
- **Interpretation** — SpecAble derives typed product knowledge from documents.
- **Reasoning** — validation, projection, and agent tools consume derivable
  views; they do not redefine ontology or introduce editable graph stores.

## Demo

Conceptual walkthrough with **synthetic** product knowledge only:

1. Start from example semantic documents aligned with milestone 3 (Capability,
   Actor, Story, or similar) — illustrated as human-readable documents plus
   equivalent structured-storage perspectives, not executed through a parser.
2. Walk through **interpretation** of those documents into interpreted concepts
   with stable identity, type, status, and formal fields at the domain
   boundary.
3. Show typed **relationships** becoming explicit edges with provenance back
   to the asserting documents — including one deliberately broken reference
   recorded as an interpretation gap.
4. Present **evidence and provenance** linked to concepts and edges, plus one
   case where evidence is missing and the gap is reported.
5. Summarize **derivable views** that validation and PRD projection could
   consume next — concept catalog, relationship index, traceability map, gap
   report — without running validation or generating a PRD.

This demo ratifies the conceptual interpretation contract. Parsers, storage
backends, CLI graph commands, and automated interpretation tests belong in
later milestones.

## Expected result

- The semantic interpretation layer is documented and ratified as the alpha
  contract between wiki documents and machine reasoning.
- Interpreted concepts, relationships, provenance, gaps, and derivable views
  are defined without implementation-specific graph technology.
- Reviewers agree the model is sufficient for PRD readiness validation, PRD
  projection, MCP resource design, and future roadmap or slice generation —
  without revisiting ontology boundaries or introducing graph authoring.
- Milestone 3 documents can be **understood** by the model in principle with
  explicit, traceable relationships and reported gaps where content is
  incomplete.

## User-visible or agent-visible behavior

- Authors continue editing **semantic documents**; they do not edit graph
  nodes or relationship records directly.
- SpecAble presents **what it understood** from documents: typed concepts,
  explicit relationships, linked evidence, and reported gaps.
- Interpretation findings reference semantic fields, primitive identity, and
  source documents — not parser internals or storage paths.
- Future agents consume the same interpreted model whether documents live in
  wiki pages, JSON fixtures, or SQLite indexes.
- Incomplete product knowledge is visible as gaps before validation runs,
  aligning with traceability-over-invention principles.

## Acceptance criteria

- [ ] The semantic interpretation model answers: what an interpreted concept
  is; what an interpreted relationship is; how provenance and evidence attach;
  how interpretation gaps are recorded; and what derivable views the model
  exposes.
- [ ] SpecAble can **interpret** semantic documents into a coherent internal
  model of typed concepts and relationships at the domain boundary — as a
  defined contract, not an implemented parser.
- [ ] Relationships are **explicit and traceable** to source documents and
  stable primitive identities; broken or unknown references surface as
  interpretation gaps.
- [ ] Provenance is **preserved** in the interpreted model and traceable to
  wiki sources; missing evidence is reported, not invented.
- [ ] The interpreted model provides a **stable foundation** for validation
  inputs and derived artifacts without introducing a new editable source of
  truth.
- [ ] **Contract examples or acceptance fixtures** illustrate interpretation of
  milestone 3 documents into the same semantic product knowledge model from at
  least two representation perspectives (for example, human-readable documents
  plus structured-storage adapter path).
- [ ] No graph-authoring workflow, direct node editing, or implementation-
  specific graph technology (RDF, OWL, property graphs, JSON-LD, etc.) is
  required or implied by the milestone contract.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- Semantic interpretation layer definition and alpha contract
- Interpreted concept, relationship, provenance, gap, and derivable-view
  definitions grounded in the existing primitive ontology
- Interpretation boundary between human-authored documents and machine-
  understood product knowledge
- Contract examples or acceptance fixtures showing milestone 3 documents
  interpreted into the semantic product knowledge model
- Reference interpretation walkthroughs per core primitive type
- Documentation preparing validation, projection, and MCP milestones to
  consume derivable views

## Out of scope

- Parser algorithms, concrete syntax, frontmatter keys, or file layout
- Database schemas, graph storage engines, or serialization formats
- CLI commands that load, interpret, or inspect graphs
- Automated interpretation or parity tests (later milestones prove executable
  interpretation)
- PRD readiness validation rule execution
- PRD projection templates or generated PRD output
- MCP resources, tools, or protocol adapters
- Graph authoring, direct relationship editing, or node CRUD outside
  semantic documents
- Notion or Confluence production adapters
- Expanding the ontology or redesigning the primitive model
- Roadmap or slice generation (enabled later, not specified here)

## Dependencies

- [Readable semantic wiki](readable-semantic-wiki.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Formalize the **semantic interpretation layer** as the alpha contract between
semantic documents and machine reasoning: specify how documents are understood
into interpreted concepts and relationships, how provenance and evidence
attach, how interpretation gaps are recorded, and which derivable views
validation and projection milestones will consume. Deliver reference
interpretation walkthroughs and contract examples or acceptance fixtures
demonstrating that milestone 3 documents interpret into the same semantic
product knowledge model from multiple adapter perspectives — without building
parsers, storage backends, or CLI commands in this milestone.

### Users / actors

- Product owners and engineers authoring semantic documents who need SpecAble
  to reflect what it understood from their wiki
- Maintainers defining interpretation contracts before validation, projection,
  and MCP milestones
- Future AI clients consuming interpreted concepts, relationships, gaps, and
  derivable views regardless of storage form

### Required behavior

- Interpretation produces typed **interpreted concepts** mapped to existing
  ontology primitives with stable identity, status, and formal fields from
  document metadata
- Interpretation produces explicit **interpreted relationships** with canonical
  relationship kinds, stable endpoints, and provenance to asserting documents
- **Provenance and evidence** from documents flow into the interpreted model;
  missing evidence becomes a reported gap, not fabricated metadata
- **Interpretation gaps** are first-class outputs for unknown references,
  schema violations, missing required fields, invalid relationship kinds, and
  identity collisions
- **Derivable views** (concept catalog, relationship index, traceability map,
  gap report, validation inputs, projection inputs) are defined as stable
  projections of the interpreted model
- The semantic product knowledge model is **derived read-only knowledge**;
  authors edit documents only — no parallel editable graph source of truth
- JSON and SQLite adapter paths normalize to the same interpreted model as
  readable wiki documents at the contract level

### Constraints

- Extend interpretation atop the existing primitive ontology — do not introduce
  new primitive types or wiki-specific ontology concepts
- Local-first; synthetic fixtures only in demos and contract examples
- Adapter-independent semantics: interpretation rules belong at the domain
  boundary, not inside storage-format-specific modules
- Traceability: every interpreted concept and relationship links to source
  documents; gaps are reported instead of silent inference
- No parser, database, graph storage, or serialization format design in this
  milestone — record open implementation choices as decisions to make later,
  not decisions made here
- Align with derivation-over-duplication: interpreted model and derivable views
  are derived from wiki content, not maintained as parallel artifacts

### Non-goals

- Reference interpreter, parser, or CLI implementation
- Automated interpretation or cross-adapter parity tests
- Running validation rules or PRD readiness checks
- Generating PRD or summary artifacts
- MCP exposure
- Graph authoring workflows or direct node/edge editing
- External tool sync (Notion, Confluence, Jira, etc.)
- Roadmap, slice, or release planning generation

### Success definition

The semantic interpretation layer is ratified, contract examples or
acceptance fixtures demonstrate that milestone 3 documents interpret into a
coherent semantic product knowledge model with explicit relationships and
reported gaps, and reviewers confirm the contract is ready for validation,
PRD projection, and MCP design in later milestones — without introducing a
competing editable source of truth.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/4
- Prior milestone: [readable-semantic-wiki.md](readable-semantic-wiki.md)
- Superseded: [link-primitive-graph.md](link-primitive-graph.md)
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/92 (pivot),
  https://github.com/PathableAI-org/SpecAble/issues/70 (setup — revise after [#93](https://github.com/PathableAI-org/SpecAble/issues/93))

## Risks or blockers

- Tension between keeping the spec implementation-agnostic and wanting
  executable proof — mitigate by separating interpretation contract
  ratification (this milestone) from interpreter implementation and automated
  tests (later milestones)
- Collapsing interpretation into graph storage design — mitigate by defining
  the semantic product knowledge model as conceptual and read-only
- Product Decision, Product Risk, and Evidence boundary may affect how
  evidence and provenance appear in interpreted concepts
- Minimum required fields per primitive type must stay aligned with milestone 2,
  milestone 3, and future Active-status validation

## Completion evidence

- [ ] Semantic interpretation model section reviewed and accepted as alpha
  interpretation contract
- [ ] Demo walkthrough completed with synthetic data
- [ ] Acceptance criteria satisfied
- [ ] Contract examples or acceptance fixtures demonstrate adapter-agnostic
  interpretation parity at the model level
- [ ] Related GitHub issues closed or retargeted for revised scope
