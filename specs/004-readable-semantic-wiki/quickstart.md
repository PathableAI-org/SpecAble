# Quickstart: Readable Semantic Wiki

**Feature**: `004-readable-semantic-wiki`  
**Plan**: [plan.md](./plan.md)  
**Contracts**: [semantic-document-model.md](./contracts/semantic-document-model.md), [reference-mappings.md](./contracts/reference-mappings.md), [representation-perspectives.md](./contracts/representation-perspectives.md)

## Prerequisites

- Milestone 3 (create and inspect primitives) complete or equivalent `@specable/domain` schemas available
- No build required for contract review; optional build if cross-checking structured-storage examples against domain decode

```bash
cd SpecAble
pnpm install --frozen-lockfile   # optional
pnpm check                       # optional sanity check
```

## What this quickstart validates

This milestone ratifies a **conceptual contract** — not executable CLI behavior. Validation is a **reviewer walkthrough** confirming:

1. The semantic document model answers six contract questions
2. Reference mappings cover all eight core alpha types
3. Contract examples show semantic parity across two representation perspectives
4. Human-readable examples are understandable without SpecAble

## Step 1 — Read the normative contract

Open [contracts/semantic-document-model.md](./contracts/semantic-document-model.md).

Confirm the contract defines:

- [ ] Semantic node criteria
- [ ] Metadata vs body responsibilities
- [ ] Relationship edge tuple `(sourceId, relationshipKind, targetId)`
- [ ] Stable identity rules
- [ ] Provenance expectations
- [ ] Joint human-readable and machine-processable requirements

**Expected**: All six topics addressed without parser syntax or file layout prescriptions.

## Step 2 — Review per-type reference mappings

Open [contracts/reference-mappings.md](./contracts/reference-mappings.md).

For each of the eight types (Objective, Actor, Persona, DomainConcept, Capability, ExpectedResult, Workflow, Story):

- [ ] Metadata fields listed with M/B/R layer assignments
- [ ] Body role described
- [ ] Relationship participation documented
- [ ] Identity and provenance expectations present

**Expected**: SC-001 satisfied — 100% type coverage.

## Step 3 — Compare representation perspectives

Open [contracts/representation-perspectives.md](./contracts/representation-perspectives.md).

For each paired example (Capability, Story, Actor, Objective):

| Type | Structured storage | Human-readable |
|------|-------------------|----------------|
| Capability | [cap-schedule-session.json](./contracts/examples/structured-storage/cap-schedule-session.json) | [cap-schedule-session.txt](./contracts/examples/human-readable/cap-schedule-session.txt) |
| Story | [story-coach-schedules-session.json](./contracts/examples/structured-storage/story-coach-schedules-session.json) | [story-coach-schedules-session.txt](./contracts/examples/human-readable/story-coach-schedules-session.txt) |
| Actor | [actor-care-coach.json](./contracts/examples/structured-storage/actor-care-coach.json) | [actor-care-coach.txt](./contracts/examples/human-readable/actor-care-coach.txt) |
| Objective | [obj-improve-coach-utilization.json](./contracts/examples/structured-storage/obj-improve-coach-utilization.json) | [obj-improve-coach-utilization.txt](./contracts/examples/human-readable/obj-improve-coach-utilization.txt) |

**Parity checklist** (for each pair):

- [ ] Same `id`, `type`, `name`, `status`
- [ ] Same relationship target IDs and kinds
- [ ] No adapter-local identifier used as canonical `id`
- [ ] Required semantics present in metadata, not body-only

**Expected**: SC-002 and SC-007 satisfied for four types.

## Step 4 — Human readability check (SC-003)

Ask a reviewer who has **not** used SpecAble to read:

- [human-readable/cap-schedule-session.txt](./contracts/examples/human-readable/cap-schedule-session.txt)
- [human-readable/story-coach-schedules-session.txt](./contracts/examples/human-readable/story-coach-schedules-session.txt)

**Expected**: Reviewer identifies product intent within 5 minutes per document without running SpecAble.

## Step 5 — Domain-boundary recoverability (conceptual)

For [structured-storage/cap-schedule-session.json](./contracts/examples/structured-storage/cap-schedule-session.json):

Trace how fields map to `@specable/domain` Capability Schema:

- [ ] `type`, `id`, `name`, `status` → `PrimitiveBaseFields`
- [ ] `actors`, `domainConcepts`, `expectedResults`, `workflows` → relationship reference fields
- [ ] Record decodes without NLP on any separate body document

**Expected**: FR-017 satisfied — milestone 2 semantics recoverable at domain boundary.

Optional automated check (not required this milestone):

```bash
# Future: Schema.decodeUnknown(Capability)(jsonRecord)
```

## Step 6 — Milestone 2 structured-storage cross-check (optional)

If milestone 2 CLI is available:

```bash
pnpm build
pnpm --filter @specable/cli exec specable init /tmp/wiki-demo-json
pnpm --filter @specable/cli exec specable primitive create /tmp/wiki-demo-json \
  --type Capability --name "Schedule coaching session" --status Active
```

Compare persisted record shape to [cap-schedule-session.json](./contracts/examples/structured-storage/cap-schedule-session.json) — field names and ID semantics should align at the domain boundary.

**Expected**: Structured storage perspective matches milestone 2 create/get projection (identity and type fields; relationship fields when supplied).

## Step 7 — Demo walkthrough (SC-006)

Follow the milestone demo script from [docs/milestones/readable-semantic-wiki.md](../../docs/milestones/readable-semantic-wiki.md#demo):

1. [ ] Start from synthetic primitives aligned with milestone 2
2. [ ] Show mapping to semantic documents (metadata, body, relationships, provenance)
3. [ ] Confirm human readability without SpecAble (Step 4)
4. [ ] Walk through domain-boundary recoverability (Step 5)
5. [ ] Show second representation perspective parity (Step 3)

## Step 8 — Reviewer sign-off (SC-004, SC-005)

Reviewers confirm:

- [ ] Model is sufficient for semantic interpretation layer (next milestone)
- [ ] No ontology boundary changes required
- [ ] No adapter-specific concepts in canonical identity or relationship kinds
- [ ] Open format choices documented as future decisions, not decisions made

## Failure scenarios (contract-level)

| Scenario | Expected contract behavior |
|----------|---------------------------|
| Required `status` only in body prose | Non-conformant |
| `id` equals file path | Non-conformant |
| Story links to actor by display name only | Non-conformant for required edge |
| Missing `evidence` / provenance | Valid; gap reportable later |
| Body edited, metadata identity unchanged | Identity preserved |

## Out of scope for this quickstart

- Parser or adapter execution
- Automated CI parity tests
- CLI wiki read/write commands
- Semantic interpretation service
- Active-status validation

## Next milestone

After reviewer sign-off, proceed to `/speckit-specify` or planning for the [semantic interpretation layer](../../docs/milestones/semantic-interpretation-layer.md).
