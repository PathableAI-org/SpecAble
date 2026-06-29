# Reference Mappings: Primitive Type → Semantic Document

**Feature**: `004-readable-semantic-wiki`  
**Domain source**: `@specable/domain` primitive schemas

Each section defines how one ontology type maps to semantic document **metadata**, **body**, **relationships**, **identity**, and **provenance**.

Legend:

- **M** = metadata (required for machine processability)
- **B** = body (human expansion; MUST NOT be sole carrier if marked M)
- **R** = relationship field (stable ID references)

---

## Objective

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | Stable identity |
| `type` = `Objective` | M | yes | |
| `name` | M | yes | Display name |
| `status` | M | yes | |
| `description` | M/B | no | MAY expand in body |
| `successCriteria` | M/B | no | Outcome framing |
| `expectedResults` | M (R) | no | → ExpectedResult IDs |
| `workflows` | M (R) | no | → Workflow IDs |
| `evidence`, `notes`, `tags` | M | no | Provenance / supplementary |

**Body role**: Explain why this objective matters, stakeholder context, success narrative beyond `successCriteria`.

**Relationship participation**: Source of edges to ExpectedResult, Workflow.

---

## Actor

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `Actor` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `category` | M | no | Human, System, AI Agent, etc. |
| `description` | M/B | no | |
| `evidence`, `notes`, `tags` | M | no | |

**Body role**: Describe the actor's role in product behavior, responsibilities, constraints.

**Relationship participation**: Target of Story.actor, Capability.actors, Workflow.primaryActors, Persona.primaryActors.

---

## Persona

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `Persona` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `confidence` | M | no | Hypothesis / Validated / etc. |
| `goalsOrPainPoints` | M/B | no | MAY expand in body |
| `primaryActors` | M (R) | no | → Actor IDs (with optional role) |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: Research context, behavioral insights, scenarios — evidence-backed archetype narrative.

**Relationship participation**: Source of edges to Actor.

---

## Domain Concept

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `DomainConcept` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `definition` | M/B | no | Semantic definition |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: Usage examples, glossary context, disambiguation from related concepts.

**Relationship participation**: Target of Capability.domainConcepts, Workflow.domainConcepts.

---

## Capability

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `Capability` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `actors` | M (R) | no | → Actor IDs |
| `domainConcepts` | M (R) | no | → DomainConcept IDs |
| `expectedResults` | M (R) | no | → ExpectedResult IDs |
| `workflows` | M (R) | no | → Workflow IDs |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: Operational detail, preconditions, failure modes, UX notes.

**Relationship participation**: Source to Actor, DomainConcept, ExpectedResult, Workflow; target of Story.capability, ExpectedResult.capabilities, Workflow.capabilities.

---

## Expected Result

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `ExpectedResult` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `definition` | M/B | no | Observable changed state |
| `capabilities` | M (R) | no | → Capability IDs |
| `objectives` | M (R) | no | → Objective IDs |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: How observers recognize the outcome, measurement context (without inventing metrics).

**Relationship participation**: Source to Capability, Objective; target of Objective.expectedResults, Capability.expectedResults, Workflow.expectedResults, Story.expectedResult.

---

## Workflow

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `Workflow` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `sequenceNotes` | M/B | no | Step/sequence notes |
| `objectives` | M (R) | no | → Objective IDs |
| `primaryActors` | M (R) | no | → Actor IDs (with role) |
| `capabilities` | M (R) | no | → Capability IDs |
| `domainConcepts` | M (R) | no | → DomainConcept IDs |
| `expectedResults` | M (R) | no | → ExpectedResult IDs |
| `stories` | M (R) | no | → Story IDs |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: Expanded step-by-step flow, handoffs, exception paths (sequence narration).

**Relationship participation**: Hub connecting objectives, actors, capabilities, concepts, results, stories.

---

## Story

| Field | Layer | Required at Draft | Notes |
|-------|-------|-------------------|-------|
| `id` | M | yes | |
| `type` = `Story` | M | yes | |
| `name` | M | yes | |
| `status` | M | yes | |
| `text` | M/B | no | Generated or authored story sentence |
| `actor` | M (R) | no | → single Actor ID |
| `capability` | M (R) | no | → single Capability ID |
| `expectedResult` | M (R) | no | → single ExpectedResult ID |
| `workflows` | M (R) | no | → Workflow IDs |
| `description`, `evidence`, `notes`, `tags` | M | no | |

**Body role**: User scenario context, acceptance nuance, edge-case narration beyond `text`.

**Relationship participation**: Source to Actor, Capability, ExpectedResult, Workflow; target of Workflow.stories.

---

## Identity rules (all types)

| Rule | Applies to |
|------|------------|
| `id` assigned once, never derived from name or path | All types |
| Display name changes do not change `id` | All types |
| Adapter sync IDs stored separately from `id` | All adapters |
| Relationship edits do not reassign endpoint identities | All relationship fields |

## Provenance expectations (all types)

| Field / block | Purpose |
|---------------|---------|
| `evidence` | Primary source reference (interviews, decisions, tickets) |
| `notes` | Change context, open questions |
| `authorship` (extension) | Who/when/asserted-vs-observed — interpretation layer |
| `derivedFrom` (extension) | Lineage for generated artifacts — projection milestones |

Missing provenance is valid; gaps reported in later stages.
