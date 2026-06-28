# PRD projection

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Establish **PRD projection** — the conceptual contract for how SpecAble derives a
coherent Product Requirements Document from validated product knowledge. By the end
of this milestone, SpecAble has a clear definition of the PRD as the **first major
human-readable projection** over the semantic product model: a derived artifact that
accurately represents current product understanding, preserves narrative readability,
remains traceable to semantic concepts, and never becomes an independent source of
truth.

This slice bridges PRD readiness validation (milestone 5) and later adapter milestones
that expose the same semantic model to agents and external tools.

## Why this matters

Milestones 3–5 established what authors write (semantic documents), what SpecAble
understands (interpreted concepts, relationships, provenance, and gaps), and whether
that understanding is sufficient for credible product reasoning (PRD readiness
validation). Alpha’s thesis depends on the next step: **SpecAble must be able to
project validated understanding into a human-readable PRD** that stakeholders can
review — without treating that document as the place product knowledge lives.

Without a defined projection contract, later work risks collapsing into template
design, prose generation pipelines, or editable PRD documents that compete with the
wiki. PRD projection keeps semantic documents as the sole editable source of truth
while making the PRD a traceable, reproducible **evidence artifact** that sufficient
product understanding exists.

## PRD projection model

The following is the **conceptual contract** this milestone ratifies. Later
milestones implement projection engines, CLI commands, and MCP exposure against
this model. No PRD templates, rendering technologies, serialization formats,
storage layouts, or generation algorithms are prescribed here.

### Projection boundary

**PRD projection** is the act of composing a coherent Product Requirements Document
from the **semantic product knowledge model** and its **PRD readiness validation
assessment** — producing a human-readable narrative derived entirely from validated
understanding.

```text
Human-editable semantic documents (wiki)          ← source of truth
        │
        ▼  interpret
Semantic product knowledge model
        │
        ▼  validate (PRD readiness)
Validation assessment
        │
        ▼  project
Product Requirements Document (PRD)               ← derived projection
```

- **Input:** semantic product knowledge model (interpreted concepts, relationships,
  provenance, derivable views) plus validation assessment (readiness posture,
  findings, preserved uncertainty, downstream blocker signals).
- **Output:** a coherent PRD — a human-readable product narrative with traceability
  back to contributing semantic knowledge.
- **Non-goal:** authors do not edit the PRD to change product meaning; they edit
  semantic documents, and SpecAble re-derives the PRD.

### PRD as projection, not source of truth

The **semantic product model** — wiki-backed product knowledge expressed as semantic
documents interpreted into typed primitives and relationships — remains the
**canonical source of truth**.

The PRD is:

- **derived** — always recomputed from current wiki content and validation posture;
- **read-only as product knowledge** — revising product intent happens in semantic
  documents, not by treating PRD prose as authoritative;
- **evidence of understanding** — demonstrates that the semantic model contains
  sufficient coherent knowledge for human stakeholders;
- **traceable** — every substantive part of the narrative links back to explicit
  semantic concepts, relationships, and provenance.

The PRD is NOT:

- a competing wiki or parallel product-knowledge store;
- a place to introduce new primitives, relationships, or decisions that bypass
  semantic documents;
- a durable cache that authors maintain independently of the wiki;
- validation input — generated PRD text MUST NOT feed back into interpretation or
  validation as if it were source knowledge.

### Grounded narrative

A **projected PRD** is a coherent human-readable account of product intent assembled
from interpreted product knowledge. It translates typed semantics into narrative
form stakeholders can read without running SpecAble.

Conceptually, projection:

- **selects and orders** interpreted concepts and relationships into a readable
  product story appropriate for a requirements audience;
- **preserves human-readable narrative** — explanatory prose from semantic document
  bodies MAY inform phrasing where traceability allows, but required semantics come
  from structured knowledge, not invented summary text;
- **surfaces uncertainty** — Draft status, weak evidence, and validation findings
  appear as explicit caveats rather than false certainty;
- **respects readiness posture** — when validation reports blocking gaps, projection
  either withholds affected narrative, marks it as incomplete, or produces a clearly
  qualified draft; it does not fabricate missing understanding.

Projection MUST NOT duplicate product knowledge in forms that cannot be traced back
to semantic concepts. If the same fact appears in multiple narrative places, each
appearance MUST cite the same underlying primitive identities and relationships.

### Traceability

**Traceability** is a first-class requirement of PRD projection. Every substantive
unit of PRD content MUST be **grounded** in explicit semantic knowledge:

- **contributing concepts** — stable primitive identities that support the narrative;
- **contributing relationships** — typed edges that explain how concepts connect in
  product terms;
- **source documents** — semantic documents that asserted the underlying knowledge;
- **provenance and evidence** — available support for decisions, risks, and claims,
  or explicit markers where evidence is missing;
- **validation linkage** — where readiness findings affect narrative confidence,
  projection records which findings qualify or limit the text.

Traceability flows **from PRD content back to semantic knowledge**, never the
reverse. Readers MUST be able to answer: *which primitives and relationships justify
this part of the PRD?*

When grounding is impossible because validation or interpretation reports gaps,
projection **reports the gap** in product terms instead of inventing meaning.

### Derivation over duplication

PRD projection follows **derivation over duplication**:

- product knowledge is **authored once** in semantic documents;
- interpretation and validation **ensure sufficient understanding**;
- the PRD **generates from** that validated understanding;
- no parallel product-fact layer accumulates in the PRD that would require separate
  maintenance.

If stakeholders disagree with PRD content, the resolution path is **wiki refinement**
— editing semantic documents and re-running interpretation, validation, and
projection — not editing the PRD as canonical state.

### Relationship to validation

PRD projection **consumes** PRD readiness validation; it does not replace it.

| Validation provides | Projection uses |
| --- | --- |
| Readiness posture | Whether a credible PRD can be produced now |
| Blocking findings | Which narrative areas must be withheld, qualified, or marked incomplete |
| Advisory findings | Where caveats and refinement notes belong |
| Preserved uncertainty | How confidently each part of the story can be told |
| Traceability to concepts | Which primitives ground each narrative segment |

Projection MUST NOT treat blocking validation findings as ignorable warnings when
presenting content as settled product intent. Validation makes projection **credible**;
projection makes validation **visible** to human stakeholders in narrative form.

### First major derived artifact

Among alpha projections, the PRD is the **first major human-readable artifact** derived
from the semantic product model. It proves the end-to-end chain:

```text
author semantic documents → interpret → validate readiness → project PRD
```

Later milestones may expose the same model through MCP and additional views. This
milestone establishes the projection pattern — derived, traceable, non-authoritative —
that those surfaces inherit.

## What projection answers

After successful validation, SpecAble MUST be able to determine:

| Question | Projection output |
| --- | --- |
| Can we produce a coherent PRD now? | A readable document reflecting readiness posture |
| What product story does validated knowledge support? | Grounded narrative from interpreted concepts |
| Where is each part of the story justified? | Traceability from narrative units to semantic concepts |
| What remains uncertain or incomplete? | Explicit caveats tied to validation findings |
| Does the semantic model suffice for stakeholders? | Evidence that understanding is expressible in PRD form |

This milestone defines **what PRD projection means**. It does not implement
generators, CLI commands, or storage for projected output.

## Architectural placement

```text
Milestone 3: semantic document model (what authors write)
        │
        ▼
Milestone 4: semantic interpretation layer (what SpecAble understands)
        │
        ▼
Milestone 5: PRD readiness validation (whether understanding is sufficient)
        │
        ▼
Milestone 6: PRD projection (first major human-readable derived artifact)  ← this milestone
        │
        ▼
Later: MCP adapter and additional views over the same semantic model
```

- **Wiki** — canonical editable representation; humans edit semantic documents only.
- **Interpretation** — SpecAble derives typed product knowledge from documents.
- **Validation** — SpecAble judges PRD readiness of that knowledge.
- **Projection** — SpecAble composes a traceable PRD from validated understanding.
- **Agents and adapters** — consume the same semantic foundation; they do not redefine
  projection or introduce editable PRD stores.

## Demo

Conceptual walkthrough with **synthetic** product knowledge only:

1. Start from an interpreted semantic product knowledge model and PRD readiness
   validation assessment aligned with milestone 5 contract examples — illustrated as
   interpreted concepts, relationships, findings, and readiness posture, not executed
   through a projector.
2. Walk through **PRD projection** of that validated model into a coherent
   human-readable product narrative appropriate for stakeholder review.
3. For representative narrative segments, show **traceability** back to contributing
   primitive identities, relationships, source documents, and available evidence.
4. Present one segment where **validation uncertainty** is preserved as an explicit
   caveat rather than confident requirements prose.
5. Present one segment where a **blocking finding** prevents presenting incomplete
   knowledge as settled intent — projection qualifies or omits instead of inventing.
6. Confirm the PRD **does not introduce** product facts absent from semantic
   documents and that revising product meaning requires wiki edits, not PRD edits.

This demo ratifies the conceptual projection contract. Generators, CLI commands,
rendering pipelines, and automated projection tests belong in later milestones.

## Expected result

- PRD projection is documented and ratified as the alpha contract for the first major
  human-readable derived artifact over validated product knowledge.
- Grounding, traceability, derivation-over-duplication, and non-authoritative PRD
  status are defined without implementation-specific generation technology.
- Reviewers agree the model is sufficient for later CLI and MCP milestones to expose
  projection — without revisiting ontology boundaries, designing PRD templates, or
  treating the PRD as an editable source of truth.
- The milestone clearly establishes projection as the capstone of the
  author → interpret → validate → project chain for alpha.

## User-visible or agent-visible behavior

- Authors continue editing **semantic documents**; the PRD is not the editing surface
  for product knowledge.
- Stakeholders receive a **coherent, readable PRD** that reflects current validated
  understanding of the product.
- Every substantive part of the PRD can be **traced** to semantic concepts and
  relationships — not to free-floating prose.
- **Gaps and uncertainty** from validation appear in the narrative posture; projection
  does not hide blocking findings behind confident language.
- Re-running projection after wiki changes produces an updated PRD from the same
  semantic foundation — reproducible derivation, not manual PRD maintenance.
- Future agents consume projection traceability metadata alongside narrative content;
  they do not treat generated PRD text as authoritative product state.

## Acceptance criteria

- [ ] The PRD projection model answers: what projection consumes and produces; why
  the PRD is a derived projection rather than source of truth; how narrative content
  is grounded in semantic knowledge; how traceability is preserved; and how
  validation posture shapes credible output.
- [ ] SpecAble can **derive a coherent PRD** from validated product knowledge — as a
  defined contract, not an implemented generator.
- [ ] **Every substantive part of the PRD** is grounded in explicit semantic concepts
  and relationships traceable to source documents.
- [ ] **Traceability from PRD content back to semantic concepts** is preserved; readers
  can justify narrative segments from wiki-backed knowledge.
- [ ] The PRD **does not introduce duplicated product knowledge** that cannot be
  traced to semantic documents; derivation replaces parallel fact maintenance.
- [ ] The PRD **demonstrates sufficient understanding** for human stakeholders —
  evidence that the semantic model supports credible product requirements narrative.
- [ ] Projection **respects validation readiness** — blocking gaps are not presented
  as settled intent; uncertainty is preserved where validation requires it.
- [ ] **Contract examples or acceptance fixtures** illustrate PRD projection over the
  same semantic product knowledge model and validation assessment from at least two
  representation perspectives (for example, human-readable documents plus
  structured-storage adapter path).
- [ ] No PRD templates, rendering technologies, storage formats, LLM prompts, or
  workflow-specific planning concepts are required or implied by the milestone
  contract.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- PRD projection definition and alpha contract
- Projection boundary between validated semantic knowledge and human-readable PRD output
- Grounding, traceability, derivation-over-duplication, and non-authoritative PRD
  status
- Relationship between validation assessment and projected narrative credibility
- PRD as first major human-readable derived artifact and evidence of sufficient
  understanding
- Contract examples or acceptance fixtures showing projection over milestone 5
  validated models
- Documentation preparing CLI and MCP milestones to expose projection traceability

## Out of scope

- PRD templates, section outlines, or minimum required PRD structure
- Rendering technologies (Markdown, HTML, PDF, Org, etc.)
- Storage layouts, caches, or persistence of projected output
- LLM prompts, model selection, or narrative generation algorithms
- CLI `specable projection prd` (or equivalent) command implementation
- Automated projection or parity tests (later milestones prove executable projection)
- MCP projection resources, tools, or protocol adapters
- Release planning, slice planning, or implementation planning generation
- Introducing new ontology primitives or expanding the product primitive model
- Graph authoring, direct PRD editing as canonical product knowledge, or PRD-to-wiki
  reverse sync
- Notion or Confluence production adapters

## Dependencies

- [Readable semantic wiki](readable-semantic-wiki.md)
- [Semantic interpretation layer](semantic-interpretation-layer.md)
- [PRD readiness validation](validate-desired-product-state.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Formalize **PRD projection** as the alpha contract for deriving a coherent Product
Requirements Document from validated product knowledge: specify what projection
consumes (interpreted model and validation assessment), what it produces (grounded
human-readable narrative with traceability), how the PRD remains non-authoritative,
how validation posture shapes output credibility, and how projection demonstrates
sufficient understanding without duplicating product knowledge. Deliver reference
projection walkthroughs and contract examples or acceptance fixtures demonstrating
PRD derivation over milestone 5 validated models from multiple adapter perspectives
— without building generators, CLI commands, templates, or storage backends in this
milestone.

### Users / actors

- Product owners and stakeholders who need a readable PRD reflecting current product
  understanding without maintaining a parallel prose source of truth
- Engineers reviewing requirements who need traceability from narrative back to
  semantic concepts and evidence
- Maintainers defining the projection contract before CLI and MCP milestones
- Future AI clients consuming projected narrative together with traceability metadata
  — not treating PRD text as authoritative product state

### Required behavior

- Projection consumes the **semantic product knowledge model** and **PRD readiness
  validation assessment** — not raw document syntax alone
- Projection produces a **coherent human-readable PRD** that accurately represents
  validated product understanding in narrative form
- **Every substantive narrative unit** is grounded in explicit interpreted concepts,
  relationships, and available provenance traceable to semantic documents
- **Traceability** flows from PRD content back to semantic knowledge; gaps in
  grounding are reported, not invented
- The PRD is a **derived read-only projection**; product knowledge changes only
  through semantic document edits and re-derivation
- Projection **does not duplicate** untraceable product facts; the same knowledge is
  not maintained separately in PRD prose
- Projection **respects validation readiness posture** — blocking findings limit
  credible narrative; uncertainty is preserved where validation requires it
- The PRD serves as **evidence** that the semantic model contains sufficient
  understanding for human stakeholders
- JSON, Markdown, Org, and SQLite adapter paths normalize to the same projection
  contract over the same interpreted and validated model

### Constraints

- Operate on validated semantic product knowledge — do not redefine ontology or
  introduce PRD-specific primitive types
- Local-first; synthetic fixtures only in demos and contract examples
- Adapter-independent semantics: projection reasoning belongs at the product-knowledge
  layer, not inside storage-format-specific modules
- Traceability: every substantive PRD segment links to contributing concepts and
  relationships; missing grounding is explicit
- No PRD templates, rendering technologies, storage formats, or generation algorithms
  in this milestone — record open implementation choices as decisions to make later,
  not decisions made here
- Align with derivation-over-duplication: the PRD derives from wiki-backed knowledge;
  generated PRD text is never an input to interpretation or validation
- Align with constitution principle I (Primitive Graph is Canonical): semantic product
  knowledge remains authoritative; the PRD is an output, not the model

### Non-goals

- Reference projector, template engine, or CLI implementation
- Automated projection or cross-adapter parity tests
- Defining PRD section templates or enumerating required PRD structure
- Choosing rendering or storage technology for projected output
- LLM-assisted narrative generation design
- MCP exposure
- Release planning, slice planning, or implementation planning artifacts
- Editable PRD workflows or PRD-as-source-of-truth product management
- External tool sync (Notion, Confluence, Jira, etc.)

### Success definition

PRD projection is ratified, contract examples or acceptance fixtures demonstrate
derivation of a coherent, traceable PRD from validated semantic product knowledge
without untraceable duplication, and reviewers confirm the contract is ready for
CLI and MCP implementation in later milestones — without treating the PRD as an
independent source of truth or prescribing templates and rendering technology.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: TBD
- Prior milestones: [readable-semantic-wiki.md](readable-semantic-wiki.md),
  [semantic-interpretation-layer.md](semantic-interpretation-layer.md),
  [validate-desired-product-state.md](validate-desired-product-state.md)
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/94

## Risks or blockers

- Tension between keeping the spec implementation-agnostic and wanting executable
  proof — mitigate by separating projection contract ratification (this milestone)
  from generator implementation and automated tests (later milestones)
- Collapsing projection into PRD template design — mitigate by defining narrative
  grounding and traceability without prescribing section structure
- Treating generated PRD prose as editable canonical state — mitigate by explicit
  non-authoritative PRD rules and wiki-only edit path
- Overlap between validation findings and projection caveats — mitigate by defining
  validation as input to credibility and projection as human-readable expression of
  that posture
- Product Decision, Product Risk, and Evidence boundary may affect how decisions and
  risks appear in grounded narrative without new primitives

## Completion evidence

- [ ] PRD projection model section reviewed and accepted as alpha projection contract
- [ ] Demo walkthrough completed with synthetic data
- [ ] Acceptance criteria satisfied
- [ ] Contract examples or acceptance fixtures demonstrate adapter-agnostic
  projection parity at the model level
- [ ] Related GitHub issues closed or retargeted for revised scope
