# PRD readiness validation

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Establish **PRD readiness validation** — the conceptual contract for how SpecAble
evaluates whether interpreted product knowledge is complete and coherent enough to
produce a high-quality Product Requirements Document. By the end of this milestone,
SpecAble has a clear definition of validation as the first **reasoning capability**
built on the semantic product knowledge model: it identifies gaps in product
understanding rather than merely rejecting malformed documents.

This slice bridges the ratified semantic interpretation layer (milestone 4) and the
projection milestones that follow: PRD generation, release planning, slice planning,
and implementation planning.

## Why this matters

Milestones 3 and 4 established what authors write (semantic documents) and what
SpecAble understands (interpreted concepts, relationships, provenance, and gaps).
Alpha’s thesis depends on a stronger step: **SpecAble must be able to judge whether
that understanding is sufficient** for credible product reasoning — not only whether
fields parse or references resolve.

Without a defined validation contract, later work risks collapsing into schema
linting, adapter-specific checks, or rules that reject structure without explaining
what product knowledge is still missing. PRD readiness validation keeps the wiki as
the sole editable source of truth while making incompleteness explicit, traceable,
and actionable for humans and agents preparing derived artifacts.

## PRD readiness validation model

The following is the **conceptual contract** this milestone ratifies. Later
milestones implement validation engines, CLI commands, and MCP exposure against
this model. No validation algorithms, parser rules, storage constraints, or
type-checking procedures are prescribed here.

### Validation boundary

**PRD readiness validation** is the act of evaluating the **semantic product
knowledge model** — the derived, read-only output of semantic interpretation — and
producing a structured assessment of whether enough coherent product knowledge
exists to support high-quality PRD projection and related downstream artifacts.

```text
Human-editable semantic documents (wiki)
        │
        ▼  interpret
Semantic product knowledge model
        │
        ▼  validate (PRD readiness)
Validation assessment
  (readiness posture · findings · preserved uncertainty · traceability)
        │
        ▼  enable
PRD projection · release planning · slice planning · implementation planning
```

- **Input:** semantic product knowledge model (interpreted concepts, relationships,
  provenance, interpretation gaps, and derivable views from milestone 4).
- **Output:** a validation assessment SpecAble and reviewers can act on — not an
  edited wiki, not a generated PRD, and not a competing source of truth.
- **Core question:** *What do we still need to understand before a competent product
  manager could write a PRD?*

Validation operates over **interpreted product knowledge**, not raw document syntax.
Malformed or uninterpretable content is already surfaced as interpretation gaps;
validation reasons about the **coherence and completeness of what was understood**.

### What validation evaluates

PRD readiness validation examines whether interpreted product knowledge supports
credible product intent end to end. It identifies:

- **missing understanding** — product concepts, framing, or intent not yet represented;
- **missing relationships** — typed connections required for coherent product narrative;
- **unsupported decisions** — choices lacking evidence, rationale, or traceable source;
- **unresolved assumptions** — beliefs treated as settled without confirmation;
- **insufficient evidence** — claims that need stronger or clearer support;
- **incomplete product intent** — objectives, capabilities, outcomes, or scope that
  cannot yet be explained consistently to a product audience.

These categories describe **kinds of product-understanding gaps**, not a closed rule
catalog. Later implementation may group findings differently; this milestone defines
the reasoning role, not every future check.

### Validation findings

A **validation finding** is a structured record that a specific gap in product
understanding affects PRD readiness. Findings are derived from the interpreted
model and traceable to contributing concepts, relationships, and source documents.

Conceptually, each finding SHOULD be able to express:

- **stable finding identity** — durable across runs for the same underlying gap;
- **severity** — how strongly the gap affects PRD projection readiness (for example,
  blocks projection vs advisory refinement);
- **affected concepts** — stable primitive identities implicated in the gap;
- **finding kind** — which class of product-understanding gap is present;
- **explanation** — why this gap matters for PRD readiness in product terms;
- **suggested next action** — what kind of wiki refinement would improve
  understanding (not auto-repair);
- **downstream blocker flag** — whether the gap should block PRD projection or later
  planning artifacts until addressed.

Findings explain **why product understanding is incomplete**. They MUST NOT redefine
ontology primitives, invent product meaning, or treat generated PRD text as evidence.

### Validation philosophy

Validation **exposes gaps in understanding** rather than merely rejecting invalid
structures.

Illustrative examples (non-exhaustive):

- an objective without measurable success criteria;
- a capability with no actor or expected result;
- a decision lacking supporting evidence or source;
- a referenced domain concept that has never been defined;
- assumptions that remain unresolved;
- conflicting definitions or relationships across interpreted concepts.

These illustrate the validation posture. They are **not** the complete validation
model and MUST NOT be hardcoded as the only checks in this milestone contract.

### Readiness posture and uncertainty

**PRD readiness** is a graded assessment, not a single boolean unless a later
surface chooses to collapse it for UX.

Validation SHOULD distinguish:

- **ready enough to project** — interpreted knowledge is sufficiently coherent for
  a first credible PRD draft with explicit caveats;
- **not yet ready** — material gaps block credible PRD projection;
- **uncertain** — knowledge is present but confidence is limited; findings preserve
  ambiguity instead of forcing false certainty.

**Uncertainty is first-class.** When evidence is weak, status is Draft, or product
intent is intentionally exploratory, validation reports the uncertainty and its
effect on PRD readiness — it does not silently promote Draft material to Active
confidence or fabricate missing support.

Lifecycle status from interpreted concepts MAY inform strictness (for example, Draft
incompleteness may warn while Active gaps may block projection), but strictness
is tied to **PRD projection readiness**, not to adapter parsing success alone.

### Traceability

Validation strengthens traceability by linking each finding to:

- affected **interpreted concepts** and **relationships**;
- **source documents** that asserted the incomplete knowledge;
- available **provenance and evidence** (or explicit absence thereof);
- **interpretation gaps** already recorded when interpretation could not recover
  required knowledge.

Validation findings are **derived assessments**. They MUST remain explainable from
wiki-backed primitives and MUST NOT become a parallel editable artifact or override
semantic documents as the source of meaning.

### Relationship to interpretation gaps

**Interpretation gaps** (milestone 4) record what SpecAble could not recover from
documents at the boundary of understanding. **Validation findings** record whether
what *was* understood is **coherent and complete enough** for PRD readiness.

The two layers complement each other:

- interpretation reports structural recovery failures and unknown references;
- validation reasons about product knowledge quality, narrative coherence, and
  evidence sufficiency over the interpreted model.

Validation MAY reference interpretation gaps but MUST NOT duplicate them without
product-level explanation. A broken reference is an interpretation concern; an
objective with no success measure is a PRD readiness concern.

### Enables downstream artifacts

PRD readiness validation exists so later milestones can project and plan with
confidence:

| Downstream capability | What validation enables |
| --- | --- |
| PRD projection | Know which sections can be drafted credibly and which require wiki refinement |
| Release planning | Surface whether product intent is stable enough to scope releases |
| Slice planning | Reveal missing capabilities, outcomes, or relationships before slicing work |
| Implementation planning | Expose unsupported decisions and unresolved assumptions before engineering handoff |

The validator makes those projections **possible** by revealing whether sufficient
product knowledge exists. It does not perform planning or generate PRDs itself.

## What validation answers

After interpreting semantic documents, SpecAble MUST be able to determine:

| Question | Validation output |
| --- | --- |
| Is interpreted product knowledge PRD-ready? | Readiness posture with explicit rationale |
| What understanding is still missing? | Validation findings grouped by product-understanding gap |
| Why is a gap blocking or advisory? | Explanation tied to PRD projection needs |
| What should authors refine next? | Suggested next actions on wiki content, not generated PRD text |
| What remains uncertain? | Preserved uncertainty and confidence limits |
| Can derived artifacts proceed? | Downstream blocker signals for projection and planning |

This milestone defines **what validation means for PRD readiness**. It does not
implement rule engines, CLI commands, or MCP resource exposure.

## Architectural placement

```text
Milestone 3: semantic document model (what authors write)
        │
        ▼
Milestone 4: semantic interpretation layer (what SpecAble understands)
        │
        ▼
Milestone 5: PRD readiness validation (whether understanding is sufficient)  ← this milestone
        │
        ▼
Later: PRD projection · MCP · roadmap/slice/implementation planning
```

- **Wiki** — canonical editable representation; humans edit documents only.
- **Interpretation** — SpecAble derives typed product knowledge from documents.
- **Validation** — SpecAble reasons about completeness and coherence of that
  knowledge for PRD readiness.
- **Projection and planning** — consume validation assessments and interpreted
  model views; they do not redefine validation or introduce editable finding stores.

## Demo

Conceptual walkthrough with **synthetic** product knowledge only:

1. Start from an interpreted semantic product knowledge model produced from milestone
   4 contract examples — illustrated as interpreted concepts, relationships,
   provenance, and any interpretation gaps, not executed through a validator.
2. Walk through **PRD readiness validation** of that model: which product-understanding
   gaps would block credible PRD projection vs which would be advisory.
3. Present representative **validation findings** for missing relationships,
   unsupported decisions, unresolved assumptions, and incomplete intent — each with
   explanation, affected concept identities, and suggested wiki refinement.
4. Show one case where **uncertainty is preserved** (Draft or weak evidence) and
   validation reports limited confidence instead of false readiness.
5. Summarize **readiness posture** and **downstream blocker** signals that PRD
   projection could consume next — without generating a PRD.

This demo ratifies the conceptual validation contract. Rule engines, CLI
`specable validate`, storage backends, and automated validation tests belong in
later milestones.

## Expected result

- PRD readiness validation is documented and ratified as the alpha contract between
  interpreted product knowledge and derived artifacts.
- Validation findings, readiness posture, uncertainty handling, and traceability
  are defined without implementation-specific rule technology.
- Reviewers agree the model is sufficient for PRD projection, MCP validation
  resource design, and future planning milestones — without revisiting ontology
  boundaries or treating validation as schema linting alone.
- The milestone clearly establishes validation as the **reasoning layer** between
  semantic interpretation and artifact generation.

## User-visible or agent-visible behavior

- Authors continue editing **semantic documents**; validation does not mutate wiki
  content.
- SpecAble presents **whether product knowledge is PRD-ready** and **what is still
  missing** in product terms — not parser errors alone.
- Findings reference interpreted concepts, relationships, source documents, and
  evidence posture — not storage paths or serialization internals.
- Future agents consume the same validation assessment whether documents live in
  wiki pages, JSON fixtures, or SQLite indexes.
- Generated PRD text is never treated as source of truth; validation assesses
  interpreted product knowledge only.

## Acceptance criteria

- [ ] The PRD readiness validation model answers: what validation evaluates; what
  a validation finding is; how readiness posture and uncertainty are expressed; how
  findings relate to interpretation gaps; and how validation enables downstream
  projection and planning.
- [ ] SpecAble can **evaluate the completeness and coherence** of interpreted product
  knowledge for PRD readiness — as a defined contract, not an implemented rule
  engine.
- [ ] Validation **identifies missing understanding** rather than merely malformed
  documents or adapter parse failures.
- [ ] Validation **preserves uncertainty** where appropriate instead of forcing false
  certainty.
- [ ] Validation **strengthens traceability** by explaining why product understanding
  is incomplete, linked to interpreted concepts and source documents.
- [ ] Validation **prepares the model for derived artifacts** without becoming another
  source of truth.
- [ ] **Contract examples or acceptance fixtures** illustrate PRD readiness assessment
  over the same semantic product knowledge model from at least two representation
  perspectives (for example, human-readable documents plus structured-storage
  adapter path).
- [ ] No validation rule algorithms, parser rules, storage constraints, type-checking
  procedures, or workflow-specific planning concepts are required or implied by the
  milestone contract.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- PRD readiness validation definition and alpha contract
- Validation boundary between interpreted product knowledge and derived artifacts
- Validation finding, readiness posture, uncertainty, and traceability definitions
- Validation philosophy: gaps in understanding over structural rejection alone
- Illustrative gap categories (non-exhaustive examples only)
- Relationship between interpretation gaps and validation findings
- Contract examples or acceptance fixtures showing validation assessment over
  milestone 4 interpreted models
- Documentation preparing PRD projection, MCP, and planning milestones to consume
  validation assessments

## Out of scope

- Validation rule algorithms, rule engines, or concrete check implementations
- Parser rules, schema linting, or document syntax validation (owned by interpretation
  boundary and adapter implementation)
- Storage constraints, database schemas, or serialization formats
- Type-checking procedures or domain decode implementation details
- CLI `specable validate` command implementation
- Automated validation or parity tests (later milestones prove executable validation)
- PRD projection templates or generated PRD output
- MCP validation resources, tools, or protocol adapters
- Release planning, slice planning, or implementation planning generation
- Workflow-specific concepts (tickets, sprints, engineering handoff workflows)
- Introducing new ontology primitives unless a proven gap cannot be expressed with
  existing types and relationships
- Graph authoring, direct node editing, or treating validation findings as editable
  wiki content

## Dependencies

- [Readable semantic wiki](readable-semantic-wiki.md)
- [Semantic interpretation layer](semantic-interpretation-layer.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Formalize **PRD readiness validation** as the alpha contract for reasoning over
interpreted product knowledge: specify what validation evaluates, what validation
findings express, how readiness posture and uncertainty are reported, how findings
trace to interpreted concepts and source documents, and how validation enables PRD
projection and future planning without becoming a competing source of truth. Deliver
reference validation walkthroughs and contract examples or acceptance fixtures
demonstrating assessment over milestone 4 interpreted models from multiple adapter
perspectives — without building rule engines, CLI commands, or storage backends in
this milestone.

### Users / actors

- Product owners and engineers refining semantic documents who need to know whether
  product knowledge is sufficient for a credible PRD
- Maintainers defining the validation contract before PRD projection and MCP
  milestones
- Future AI clients consuming readiness posture, validation findings, and blocker
  signals regardless of storage form

### Required behavior

- Validation consumes the **semantic product knowledge model** from interpretation
  (interpreted concepts, relationships, provenance, interpretation gaps, derivable
  views) — not raw document syntax alone
- Validation produces a **readiness posture** answering whether interpreted knowledge
  is sufficient for credible PRD projection, with explicit rationale
- Validation produces **findings** for missing understanding, missing relationships,
  unsupported decisions, unresolved assumptions, insufficient evidence, and incomplete
  product intent — as product-understanding gaps, not a closed exhaustive rule list
- Each finding conceptually supports stable identity, severity, affected concept
  identities, finding kind, explanation, suggested next action, and downstream
  blocker signaling
- Validation **preserves uncertainty** when status, evidence, or intent warrant limited
  confidence; it does not invent support or force Active certainty
- Validation **strengthens traceability**: findings explain incompleteness using
  interpreted concepts, relationships, source documents, and evidence posture
- Validation distinguishes **interpretation gaps** (recovery failures) from **PRD
  readiness gaps** (coherence and completeness of understood knowledge)
- Validation assessments are **derived read-only outputs**; authors edit wiki
  documents only
- JSON, Markdown, Org, and SQLite adapter paths normalize to the same validation
  contract over the same interpreted model

### Constraints

- Operate on the interpreted semantic model — do not redefine ontology or introduce
  PRD-section primitives unless existing types cannot represent required knowledge
- Local-first; synthetic fixtures only in demos and contract examples
- Adapter-independent semantics: validation reasoning belongs at the product-knowledge
  layer, not inside storage-format-specific modules
- Traceability: every finding links to interpreted concepts and available provenance;
  gaps are explained, not silently defaulted
- No validation algorithms, parser rules, storage constraints, or type-checking design
  in this milestone — record open implementation choices as decisions to make later,
  not decisions made here
- Align with derivation-over-duplication: validation assessments derive from wiki-backed
  knowledge; generated PRDs and plans are never validation inputs
- Status-aware strictness MAY inform severity but MUST tie to PRD projection readiness,
  not adapter parsing success alone

### Non-goals

- Reference validator, rule engine, or CLI implementation
- Automated validation or cross-adapter parity tests
- Generating PRD, release plan, slice plan, or implementation plan artifacts
- MCP exposure
- Schema linting or document syntax checking as the primary validation story
- Workflow-specific planning primitives or engineering handoff automation
- Elicitation or LLM-driven repair of wiki content
- External tool sync (Notion, Confluence, Jira, etc.)

### Success definition

PRD readiness validation is ratified, contract examples or acceptance fixtures
demonstrate assessment over a coherent interpreted semantic product knowledge model
with explicit findings and preserved uncertainty, and reviewers confirm the contract
is ready for PRD projection and MCP design in later milestones — without introducing
a competing editable source of truth or collapsing validation into parser rules.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/5 (title and
  description to be updated after merge per [#93](https://github.com/PathableAI-org/SpecAble/issues/93))
- Prior milestones: [readable-semantic-wiki.md](readable-semantic-wiki.md),
  [semantic-interpretation-layer.md](semantic-interpretation-layer.md)
- Supersedes prior graph-first validation scope in this document
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/93 (pivot),
  https://github.com/PathableAI-org/SpecAble/issues/70 (setup — to be revised)

## Risks or blockers

- Tension between keeping the spec implementation-agnostic and wanting executable
  proof — mitigate by separating validation contract ratification (this milestone)
  from validator implementation and automated tests (later milestones)
- Collapsing validation into v0-style schema linting or Active field checks —
  mitigate by centering PRD readiness and product-understanding gaps
- Overlap between interpretation gaps and validation findings — mitigate by
  defining distinct roles: recovery vs coherence/completeness
- Product Decision, Product Risk, and Evidence boundary may affect how unsupported
  decisions and insufficient evidence appear in findings
- Minimum knowledge expectations per primitive type must stay aligned with milestones
  3–4 and future PRD projection templates

## Completion evidence

- [ ] PRD readiness validation model section reviewed and accepted as alpha
  validation contract
- [ ] Demo walkthrough completed with synthetic data
- [ ] Acceptance criteria satisfied
- [ ] Contract examples or acceptance fixtures demonstrate adapter-agnostic
  validation assessment at the model level
- [ ] Related GitHub issues closed or retargeted for revised scope
