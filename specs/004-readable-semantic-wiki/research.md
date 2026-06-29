# Research: Readable Semantic Wiki

**Feature**: `004-readable-semantic-wiki`  
**Date**: 2026-06-28

## Domain schema reference paths

Semantic document metadata MUST trace to existing `@specable/domain` Schemas. The eight alpha wiki types map to primitive modules under `packages/domain/src/`:

| Alpha wiki type | Domain Schema module | Shared base fields |
|-----------------|----------------------|--------------------|
| Objective | `packages/domain/src/primitives/Objective.ts` | `PrimitiveBaseFields` in `packages/domain/src/PrimitiveBase.ts` |
| Actor | `packages/domain/src/primitives/Actor.ts` | same |
| Persona | `packages/domain/src/primitives/Persona.ts` | same |
| Domain Concept | `packages/domain/src/primitives/DomainConcept.ts` | same |
| Capability | `packages/domain/src/primitives/Capability.ts` | same |
| Expected Result | `packages/domain/src/primitives/ExpectedResult.ts` | same |
| Workflow | `packages/domain/src/primitives/Workflow.ts` | same |
| Story | `packages/domain/src/primitives/Story.ts` | same |

Cross-cutting domain modules referenced by all semantic documents:

| Concern | Module path |
|---------|-------------|
| Stable identity, name, status, optional description/evidence/notes/tags/confidence | `packages/domain/src/PrimitiveBase.ts` |
| Typed relationship references (`id`, optional `role`) | `packages/domain/src/Reference.ts` |
| Primitive type union and decode entrypoint | `packages/domain/src/primitives/index.ts` (`Primitive`, `PrimitiveType`) |
| Lifecycle status literals (`Draft`, `Active`, `Deprecated`) | `packages/domain/src/unions/Status.ts` |

**Out of alpha wiki scope (deferred)**: `CapabilityConceptLink` in `packages/domain/src/primitives/CapabilityConceptLink.ts` — join primitive for operation-level capability-to-concept links; not one of the eight alpha semantic document types in this milestone.

Synthetic contract example IDs align with Schema `examples` annotations in the modules above (e.g. `cap-schedule-session`, `story-coach-schedules-session`, `actor-care-coach`, `obj-improve-coach-utilization`).

Structured-storage proving fixtures (milestone 2 perspective) live under `packages/cli/test/fixtures/summary/valid/` and `packages/cli/examples/`; they decode through the same domain Schemas.

---

## R1 — Delivery mode: contract-first, no runtime code

**Decision**: Ratify the semantic document model as Spec Kit documentation and static contract examples only. No new packages, services, CLI commands, or domain Schema changes in this milestone.

**Rationale**: The milestone explicitly scopes out parsers, adapters, automated parity tests, and the semantic interpretation layer. Delivering a stable contract before implementation prevents adapter-specific concepts from leaking into the ontology and matches the milestone risk mitigation (separate contract ratification from executable round-trip).

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Add `SemanticDocument` Schema to `@specable/domain` now | Premature — wrapper shape depends on interpretation-layer design; domain should stay primitive-focused |
| Build a reference Markdown adapter | Out of scope; would prescribe syntax before contract is ratified |
| Automated parity tests in CI | Deferred to later milestones per spec out-of-scope |

---

## R2 — Dual representation perspectives

**Decision**: Demonstrate semantic parity with two perspectives:

1. **Structured storage** — milestone 2 JSON primitive records (one object per primitive, fields map directly to domain Schema).
2. **Human-readable prose** — plain-language documents with an explicit metadata section and narrative body, using neutral labels (not Markdown frontmatter keys or Org syntax).

**Rationale**: FR-016 and SC-002 require two perspectives satisfying the same contract. Structured storage is the existing proving adapter; human-readable prose proves the wiki thesis without committing to a file format.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Markdown with YAML frontmatter only | Prescribes concrete syntax (out of scope) |
| SQLite rows as second perspective | Both JSON and SQLite are structured storage — insufficient diversity for "human-readable" |
| Single perspective with annotations | Fails SC-002 and milestone demo requirements |

---

## R3 — Metadata versus body split

**Decision**:

| Layer | Contents | Maps to |
|-------|----------|---------|
| **Metadata** | `id`, `type`, `name`, `status`, type-specific formal fields, relationship references, structured provenance | Domain `Primitive` Schema fields |
| **Body** | Expanded intent, context, rationale, sequence narration, stakeholder-facing explanation | Human prose; MAY echo but MUST NOT solely carry required semantics |

Optional base fields (`description`, `evidence`, `notes`, `tags`, `confidence`) MAY appear in metadata or be expanded in the body, but when present as formal fields they belong in metadata for machine processability.

**Rationale**: Aligns with milestone semantic document model section and FR-002/FR-005. Domain `PrimitiveBaseFields` already separates stable identity from human labels.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Body-only wiki with NLP extraction | Violates machine-processability requirement and constitution VII |
| All text in metadata | Fails human-readability thesis |
| Separate wiki-only field namespace | Violates FR-001 — wiki is representation, not new primitive layer |

---

## R4 — Relationship encoding in semantic documents

**Decision**: Typed relationships are expressed as **reference fields in metadata** using stable primitive IDs, matching domain Schema relationship fields (e.g., `Story.actor`, `Capability.actors`). The body MAY narrate relationships for human readers but MUST NOT be the sole carrier.

Each semantic edge normalizes to `(sourceId, relationshipKind, targetId)` where `relationshipKind` is the ontology field name (e.g., `Story.actor`, `Capability.expectedResults`).

**Rationale**: Milestone 2 primitives already encode relationships as reference arrays in structured storage. The contract extends this rule to human-readable documents without inventing new edge types.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Wiki-only link syntax (wikilinks) as canonical edges | Adapter-specific; fails stable-ID requirement |
| Infer relationships from body hyperlinks | Prose-only inference forbidden for required fields |
| Separate relationship companion file only | Allowed as adapter convention but must map to same semantic edge tuple |

---

## R5 — Provenance model

**Decision**: Provenance uses three structured categories in metadata (when available):

1. **Source references** — maps to domain `evidence` field and optional structured `sources[]` in contract examples (extension point for interpretation layer).
2. **Authorship and change context** — optional `authorship` block in contract (who/when/asserted-vs-observed); not yet in domain Schema.
3. **Derivation lineage** — reserved for generated artifacts; documented in contract, implemented in projection milestones.

Missing provenance is valid; interpretation reports gaps per FR-012.

**Rationale**: Existing `evidence` and `notes` fields cover partial provenance today. Full provenance Schema extension deferred to avoid scope creep while contract documents expectations.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Provenance prose-only in body | Fails FR-012 and traceability principle |
| New Product Decision / Evidence primitives now | Out of scope; milestone risk documents boundary |
| Full provenance Schema in domain this milestone | Implementation beyond contract ratification |

---

## R6 — Contract artifact location and normative hierarchy

**Decision**:

| Artifact | Location | Role |
|----------|----------|------|
| Normative contract | `specs/004-readable-semantic-wiki/contracts/semantic-document-model.md` | Alpha wiki contract (implementation-facing) |
| Per-type mappings | `specs/004-readable-semantic-wiki/contracts/reference-mappings.md` | SC-001 deliverable |
| Representation rules | `specs/004-readable-semantic-wiki/contracts/representation-perspectives.md` | Perspective A/B rules |
| Examples | `specs/004-readable-semantic-wiki/contracts/examples/` | SC-002 fixtures |
| Milestone narrative | `docs/milestones/readable-semantic-wiki.md` | Links to normative contract (already exists) |

**Rationale**: Spec Kit contracts are the implementation reference; milestone doc remains human-oriented release planning artifact.

---

## R7 — Synthetic fixture source

**Decision**: Reuse the coachbridge-style synthetic graph from domain Schema examples and `packages/cli/test/fixtures/summary/valid/` as the canonical contract example set (Objective, Actor, Persona, DomainConcept, Capability, ExpectedResult, Workflow, Story interlinked).

**Rationale**: Ensures contract examples align with milestone 2 primitives and existing domain documentation examples; satisfies FR-019 synthetic-only requirement.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Invent new unrelated fixtures | Harder to trace parity with milestone 2 |
| Production or customer data | Violates logging/sensitive-data and local-first rules |

---

## R8 — Error message contract (forward-looking)

**Decision**: Document that interpretation and validation errors MUST reference semantic field paths and primitive identity (e.g., `Capability.expectedResults`, `cap-schedule-session`), not parser internals. No error Schema implementation this milestone.

**Rationale**: FR-021; prepares interpretation layer without premature code.

---

## Open items deferred to next milestone

| Item | Next milestone |
|------|----------------|
| Semantic interpretation service / Layer | Semantic interpretation layer |
| `SemanticDocument` decode Schema | Semantic interpretation layer |
| Automated contract parity tests | Adapter implementation milestone |
| Concrete wiki syntax (Markdown, Org) | Readable backend adapter milestones |
| Active-status validation on interpreted documents | Validation milestone |
