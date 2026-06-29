---
description: "Task list for Readable Semantic Wiki"
---

# Tasks: Readable Semantic Wiki

**Input**: Design documents from `/specs/004-readable-semantic-wiki/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not required this milestone — spec explicitly defers automated contract/parity tests. Validation is manual reviewer walkthrough per [quickstart.md](./quickstart.md).

**Organization**: Tasks grouped by user story. This is a **documentation-first** milestone — deliverables live under `specs/004-readable-semantic-wiki/` and `docs/milestones/`; no runtime code in `packages/*`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1]–[US3]) for story phases only
- Every task includes an exact file path

## Path Conventions

- **Spec Kit feature**: `specs/004-readable-semantic-wiki/`
- **Normative contracts**: `specs/004-readable-semantic-wiki/contracts/`
- **Contract examples**: `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/` and `.../human-readable/`
- **Milestone narrative**: `docs/milestones/readable-semantic-wiki.md`
- **Domain reference (read-only)**: `packages/domain/src/primitives/`

## Implementation conventions

Per constitution v1.3.0, [plan.md](./plan.md), and
[effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md):

- **No runtime code** this milestone — contract ratification precedes interpretation services.
- **Domain boundary**: Metadata fields MUST trace to existing `@specable/domain` primitive Schemas; do not invent wiki-only types.
- **Format-agnostic**: No Markdown frontmatter keys, Org drawers, parser algorithms, or file layout in contract artifacts.
- **Synthetic fixtures only**: All examples use coachbridge-style synthetic IDs from domain Schema examples.
- **When interpretation-layer code lands** (next milestone): follow `PrimitiveService` / `StorageBackend` Layer patterns per plan Service & Layer map.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish Spec Kit contract directory layout and verify domain schema references.

**Goal**: Feature directory structure matches plan.md; research documents domain field sources.

**Checkpoint**: `contracts/examples/` directories exist; research.md cites `@specable/domain` paths.

- [x] T001 Create contract example directories `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/` and `specs/004-readable-semantic-wiki/contracts/examples/human-readable/` per plan.md
- [x] T002 [P] Document domain schema reference paths and R1–R8 decisions in `specs/004-readable-semantic-wiki/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ratify normative semantic document model and entity reference — blocks all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

**Goal**: Normative contract, data model, and per-type reference mappings published and cross-linked.

**Checkpoint**: Maintainer can answer all six contract questions from spec acceptance criteria using foundational artifacts alone.

- [x] T003 Write normative alpha wiki contract in `specs/004-readable-semantic-wiki/contracts/semantic-document-model.md` (semantic node, metadata/body, relationships, identity, provenance, human+machine processability)
- [x] T004 Write semantic document entities and non-conformance rules in `specs/004-readable-semantic-wiki/data-model.md`
- [x] T005 Write per-type metadata/body/relationship mappings for all eight alpha types in `specs/004-readable-semantic-wiki/contracts/reference-mappings.md`
- [ ] T006 Add bidirectional cross-links between `specs/004-readable-semantic-wiki/data-model.md` and `specs/004-readable-semantic-wiki/contracts/semantic-document-model.md`
- [x] T007 Add explicit non-conformance examples (body-only required semantics, adapter-local ID as canonical identity) to `specs/004-readable-semantic-wiki/contracts/semantic-document-model.md` per spec edge cases
- [ ] T008 Document Product Decision / Product Risk / Evidence boundary as assumption in `specs/004-readable-semantic-wiki/contracts/reference-mappings.md` per milestone risk register

**Checkpoint**: Foundation ready — user story example and validation work can begin.

---

## Phase 3: User Story 1 — Author Product Knowledge as Readable Semantic Documents (Priority: P1) 🎯 MVP

**Goal**: Human-readable prose examples demonstrate metadata/body separation; a reviewer can understand product intent without SpecAble.

**Independent Test**: Present synthetic human-readable documents for Capability and Story; reviewer identifies intent from body and formal fields from metadata alone per `quickstart.md` Step 4.

### Implementation for User Story 1

- [x] T009 [P] [US1] Write human-readable Capability example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/cap-schedule-session.txt`
- [x] T010 [P] [US1] Write human-readable Story example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/story-coach-schedules-session.txt`
- [x] T011 [P] [US1] Write human-readable Actor example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/actor-care-coach.txt`
- [x] T012 [P] [US1] Write human-readable Objective example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/obj-improve-coach-utilization.txt`
- [ ] T013 [P] [US1] Write human-readable Persona example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/persona-busy-coach.txt` aligned with `packages/domain/src/primitives/Persona.ts` example
- [ ] T014 [P] [US1] Write human-readable DomainConcept example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/concept-session.txt` aligned with `packages/domain/src/primitives/DomainConcept.ts` example
- [ ] T015 [P] [US1] Write human-readable ExpectedResult example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/result-less-manual-scheduling.txt` aligned with `packages/domain/src/primitives/ExpectedResult.ts` example
- [ ] T016 [P] [US1] Write human-readable Workflow example in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/workflow-session-scheduling.txt` aligned with `packages/domain/src/primitives/Workflow.ts` example
- [ ] T017 [US1] Verify all human-readable examples in `specs/004-readable-semantic-wiki/contracts/examples/human-readable/` use metadata for required semantics (not body-only) per FR-005

**Checkpoint**: User Story 1 independently testable — eight human-readable examples; Capability + Story pass SC-003 reviewer readability check.

---

## Phase 4: User Story 2 — Define Adapter Contracts Before Implementation (Priority: P2)

**Goal**: Format-agnostic contract and dual-perspective examples let maintainers evaluate future adapters without parser syntax.

**Independent Test**: Compare structured-storage and human-readable pairs for four types; confirm semantic parity and no adapter-local canonical IDs per `quickstart.md` Step 3.

### Implementation for User Story 2

- [x] T018 Write representation perspective rules in `specs/004-readable-semantic-wiki/contracts/representation-perspectives.md`
- [x] T019 [P] [US2] Write structured-storage Capability example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/cap-schedule-session.json`
- [x] T020 [P] [US2] Write structured-storage Story example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/story-coach-schedules-session.json`
- [x] T021 [P] [US2] Write structured-storage Actor example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/actor-care-coach.json`
- [x] T022 [P] [US2] Write structured-storage Objective example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/obj-improve-coach-utilization.json`
- [ ] T023 [P] [US2] Write structured-storage Persona example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/persona-busy-coach.json`
- [ ] T024 [P] [US2] Write structured-storage DomainConcept example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/concept-session.json`
- [ ] T025 [P] [US2] Write structured-storage ExpectedResult example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/result-less-manual-scheduling.json`
- [ ] T026 [P] [US2] Write structured-storage Workflow example in `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/workflow-session-scheduling.json`
- [ ] T027 [US2] Update pairing table in `specs/004-readable-semantic-wiki/contracts/representation-perspectives.md` with all eight type pairs
- [ ] T028 [US2] Add maintainer adapter evaluation checklist to `specs/004-readable-semantic-wiki/contracts/representation-perspectives.md` (metadata, body, identity, relationships, provenance gates)

**Checkpoint**: User Story 2 independently testable — SC-002 parity for ≥4 types today; all eight pairs after T023–T027.

---

## Phase 5: User Story 3 — Validate Readiness for Semantic Interpretation (Priority: P3)

**Goal**: Reviewer demo walkthrough ratifies model for next milestone; synthetic graph demonstrates recoverability at domain boundary.

**Independent Test**: Complete `quickstart.md` Steps 1–8; reviewers confirm model answers six contract questions and is sufficient for semantic interpretation layer per SC-004/SC-005.

### Implementation for User Story 3

- [x] T029 [US3] Write reviewer validation guide in `specs/004-readable-semantic-wiki/quickstart.md`
- [ ] T030 [US3] Create synthetic graph index linking all eight primitive IDs and relationship edges in `specs/004-readable-semantic-wiki/contracts/examples/README.md`
- [ ] T031 [US3] Add domain-boundary recoverability trace table (example field → domain Schema path) in `specs/004-readable-semantic-wiki/contracts/examples/README.md`
- [ ] T032 [US3] Execute quickstart reviewer walkthrough per `specs/004-readable-semantic-wiki/quickstart.md` and record pass/fail in `specs/004-readable-semantic-wiki/checklists/requirements.md` Notes section
- [ ] T033 [US3] Add interpretation-layer forward reference section to `specs/004-readable-semantic-wiki/quickstart.md` linking `docs/milestones/semantic-interpretation-layer.md`
- [ ] T034 [US3] Optional cross-check: compare `specs/004-readable-semantic-wiki/contracts/examples/structured-storage/cap-schedule-session.json` against milestone 2 `specable primitive create` output per quickstart Step 6

**Checkpoint**: User Story 3 complete — demo walkthrough documented; reviewer sign-off recorded; SC-006 satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Link milestone narrative to Spec Kit artifacts; finalize completion evidence.

**Goal**: `docs/milestones/readable-semantic-wiki.md` points to normative contract; all success criteria traceable.

**Checkpoint**: Milestone completion evidence checkboxes in `docs/milestones/readable-semantic-wiki.md` satisfied.

- [ ] T035 [P] Update Spec Kit spec link from TBD to `specs/004-readable-semantic-wiki/spec.md` in `docs/milestones/readable-semantic-wiki.md`
- [ ] T036 [P] Add normative contract link to `specs/004-readable-semantic-wiki/contracts/semantic-document-model.md` in `docs/milestones/readable-semantic-wiki.md` Links section
- [ ] T037 Mark spec quality checklist complete in `specs/004-readable-semantic-wiki/checklists/requirements.md` after quickstart validation
- [ ] T038 Verify SC-001 (100% type coverage in reference mappings) and SC-007 (zero adapter-local canonical IDs) against all files in `specs/004-readable-semantic-wiki/contracts/examples/`
- [ ] T039 Run final parity review across all pairs in `specs/004-readable-semantic-wiki/contracts/examples/` per `specs/004-readable-semantic-wiki/quickstart.md` Step 3

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — complete
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories** (T006–T008 remain)
- **User Story 1 (Phase 3)**: Depends on Foundational — human-readable examples for remaining four types
- **User Story 2 (Phase 4)**: Depends on Foundational — structured-storage examples can parallel US1 after T013–T016 human-readable drafts exist for parity
- **User Story 3 (Phase 5)**: Depends on US1 + US2 example completion for full graph index and walkthrough
- **Polish (Phase 6)**: Depends on US3 reviewer sign-off

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational — MVP scope
- **User Story 2 (P2)**: Independent after Foundational — best paired with US1 for parity checks (same synthetic IDs)
- **User Story 3 (P3)**: Depends on US1 + US2 example sets for complete walkthrough

### Parallel Opportunities

- T013–T016 (US1 remaining human-readable examples) — all [P], different files
- T023–T026 (US2 remaining structured-storage examples) — all [P], different files
- US1 and US2 example authoring can proceed in parallel once Foundational T006–T008 complete
- T035–T036 (Polish doc links) — [P]

---

## Parallel Example: User Story 1 (remaining examples)

```bash
# Launch all remaining human-readable examples together:
Task: "Write Persona example in contracts/examples/human-readable/persona-busy-coach.txt"
Task: "Write DomainConcept example in contracts/examples/human-readable/concept-session.txt"
Task: "Write ExpectedResult example in contracts/examples/human-readable/result-less-manual-scheduling.txt"
Task: "Write Workflow example in contracts/examples/human-readable/workflow-session-scheduling.txt"
```

---

## Parallel Example: User Story 2 (remaining examples)

```bash
# Launch all remaining structured-storage examples together:
Task: "Write Persona JSON in contracts/examples/structured-storage/persona-busy-coach.json"
Task: "Write DomainConcept JSON in contracts/examples/structured-storage/concept-session.json"
Task: "Write ExpectedResult JSON in contracts/examples/structured-storage/result-less-manual-scheduling.json"
Task: "Write Workflow JSON in contracts/examples/structured-storage/workflow-session-scheduling.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2 remaining tasks (T006–T008)
2. Complete Phase 3 remaining tasks (T013–T017)
3. **STOP and VALIDATE**: Run quickstart Step 4 (human readability) on Capability + Story
4. Demo readable semantic documents to stakeholders

### Incremental Delivery

1. Foundational (T006–T008) → contract cross-links and edge cases complete
2. User Story 1 (T013–T017) → eight human-readable examples → SC-003 partial
3. User Story 2 (T023–T028) → eight structured-storage pairs → SC-002 full
4. User Story 3 (T030–T034) → reviewer walkthrough → SC-004/SC-005/SC-006
5. Polish (T035–T039) → milestone doc linked → completion evidence

### Parallel Team Strategy

1. Complete Foundational T006–T008 together
2. Then split:
   - Developer A: US1 human-readable examples (T013–T016)
   - Developer B: US2 structured-storage examples (T023–T026)
3. Rejoin for parity review (T027, T039) and US3 walkthrough (T032)

---

## Notes

- Phase 1 (T001–T002) and planning artifacts (`/speckit-plan`) delivered spec, plan, data-model, contracts, quickstart, and four example pairs.
- No `packages/*` code changes unless optional Schema annotation cross-links are added later.
- Automated parity tests explicitly out of scope — manual review only
- Synthetic IDs must match domain Schema examples: `cap-schedule-session`, `story-coach-schedules-session`, `actor-care-coach`, `obj-improve-coach-utilization`, `persona-busy-coach`, `concept-session`, `result-less-manual-scheduling`, `workflow-session-scheduling`
