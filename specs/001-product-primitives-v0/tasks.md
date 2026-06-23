---
description: "Task list for SpecAble v0 — Product Primitive Graph"
---

# Tasks: SpecAble v0 — Product Primitive Graph

**Input**: Design documents from `/specs/001-product-primitives-v0/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required per constitution — schema validation, graph traversal, missing-link detection, duplicate detection, artifact generation, and loader behavior.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1]–[US4]) for story phases only
- Every task includes an exact file path

## Path Conventions

- **v0 workspace**: `packages/cli/src/` (library modules), `packages/cli/test/` (tests), `packages/cli/examples/` (bundled graphs)
- **Repository root**: CI, TS configs, ESLint, scripts, docs

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap Effect TypeScript template conventions for a one-package monorepo (`packages/cli` only).

- [ ] T001 Create root `pnpm-workspace.yaml` with `packages/*` workspace glob
- [ ] T002 Create root `package.json` with scripts (`codegen`, `check`, `typecheck` alias, `lint`, `lint-fix`, `test`, `coverage`, `build`, `clean`) per `specs/001-product-primitives-v0/plan.md`
- [ ] T003 [P] Create root `tsconfig.base.json` with strict settings, `@effect/language-service` plugin, and `@specable/cli` path alias
- [ ] T004 [P] Create root `tsconfig.json` referencing only `packages/cli`
- [ ] T005 [P] Create root `tsconfig.build.json` for publishable build graph
- [ ] T006 [P] Create root `vitest.config.ts` for monorepo test discovery
- [ ] T007 [P] Create root `eslint.config.mjs` with `@effect/eslint-plugin` flat config
- [ ] T008 [P] Create `scripts/clean.mjs` for generated output cleanup
- [ ] T009 Create `packages/cli/package.json` for `@specable/cli` with Effect dependencies, build-utils scripts, and bin entry
- [ ] T010 [P] Create `packages/cli/tsconfig.json` referencing `tsconfig.src.json` and `tsconfig.test.json`
- [ ] T011 [P] Create `packages/cli/tsconfig.src.json` for `src/` compilation
- [ ] T012 [P] Create `packages/cli/tsconfig.test.json` for `test/` compilation
- [ ] T013 [P] Create `packages/cli/tsconfig.build.json` for package build output
- [ ] T014 [P] Create `.fallowrc.json` scoped to `packages/cli` only
- [ ] T015 [P] Create `.changeset/config.json` with repo `PathableAI-org/SpecAble`
- [ ] T016 [P] Create `.github/actions/setup/action.yml` with pnpm frozen lockfile install
- [ ] T017 [P] Create `.github/workflows/check.yml` (codegen, build, source-state, check, lint, test)
- [ ] T018 [P] Create `.github/workflows/fallow-audit.yml` for PR audit and dupes jobs
- [ ] T019 [P] Create `.github/workflows/release.yml` with Changesets publish flow
- [ ] T020 [P] Create `.github/workflows/snapshot.yml` with pkg.pr.new skip-on-missing-app pattern
- [ ] T021 [P] Create `AGENTS.md` adapted from effect-typescript-template for single-package SpecAble layout
- [ ] T022 Create root `README.md` with commands, package layout, Effect guidance, publishing, and template adaptation sections

**Checkpoint**: `pnpm install`, `pnpm check`, and `pnpm lint` run (may be empty package).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schemas, graph loading, and test harness — MUST complete before user story work.

**⚠️ CRITICAL**: No user story implementation until this phase is complete.

- [ ] T023 Create shared enums in `packages/cli/src/domain/enums.ts` (`Status`, `ActorCategory`, `ConceptRole`, `ConceptImportance`, `PersonaConfidence`)
- [ ] T024 [P] Create reference schema in `packages/cli/src/domain/Reference.ts` (id + optional role)
- [ ] T025 [P] Create tagged errors in `packages/cli/src/domain/errors.ts` (`FixtureDecodeError`, `GraphProjectNotFoundError`, `DuplicateIdError`, `BrokenReferenceError`, `ValidationFailedError`, `OutputWriteError`)
- [ ] T026 [P] Create base primitive schema in `packages/cli/src/domain/PrimitiveBase.ts` (`id`, `name`, `status`, shared fields)
- [ ] T027 [P] Create Objective schema in `packages/cli/src/domain/primitives/Objective.ts`
- [ ] T028 [P] Create Actor schema in `packages/cli/src/domain/primitives/Actor.ts`
- [ ] T029 [P] Create Persona schema in `packages/cli/src/domain/primitives/Persona.ts`
- [ ] T030 [P] Create DomainConcept schema in `packages/cli/src/domain/primitives/DomainConcept.ts`
- [ ] T031 [P] Create Capability schema in `packages/cli/src/domain/primitives/Capability.ts`
- [ ] T032 [P] Create CapabilityConceptLink schema in `packages/cli/src/domain/primitives/CapabilityConceptLink.ts`
- [ ] T033 [P] Create ExpectedResult schema in `packages/cli/src/domain/primitives/ExpectedResult.ts`
- [ ] T034 [P] Create Workflow schema in `packages/cli/src/domain/primitives/Workflow.ts`
- [ ] T035 [P] Create Story schema in `packages/cli/src/domain/primitives/Story.ts`
- [ ] T036 Create primitive union and type exports in `packages/cli/src/domain/primitives/index.ts`
- [ ] T037 Create `ProductGraph` and `GraphIndex` types in `packages/cli/src/graph/ProductGraph.ts`
- [ ] T038 Create fixture filename registry in `packages/cli/src/graph/FixtureFiles.ts` per `specs/001-product-primitives-v0/contracts/fixture-format.md`
- [ ] T039 Create YAML decode helpers in `packages/cli/src/graph/YamlDecode.ts` (parse + Schema decode with file paths)
- [ ] T040 Implement `GraphLoader` service Layer in `packages/cli/src/graph/GraphLoader.ts` (load per-type files, missing file → empty, build index)
- [ ] T041 Create `FileSystem`/`GraphLoaderLive` Layer wiring in `packages/cli/src/services/Layers.ts` using `@effect/platform-node`
- [ ] T042 [P] Add schema decode tests in `packages/cli/test/domain/schema-decode.test.ts` for each primitive type
- [ ] T043 [P] Add loader tests in `packages/cli/test/graph/graph-loader.test.ts` (missing type file, broken YAML, duplicate IDs at load if pre-checked)
- [ ] T044 Run `@effect/build-utils` codegen config in `packages/cli/package.json` and generate exports via `pnpm codegen`

**Checkpoint**: Graph loads synthetic test fixtures; schema and loader tests pass.

---

## Phase 3: User Story 1 — Validate a Local Primitive Graph (Priority: P1) 🎯 MVP

**Goal**: Status-aware validation of required fields, broken references, and Active canonical rules with actionable findings.

**Independent Test**: Run validation against mixed Draft/Active/Deprecated fixtures; distinguish warnings vs failures; no network required.

### Tests for User Story 1

- [ ] T045 [P] [US1] Add validation fixture helpers in `packages/cli/test/fixtures/validation/` (valid, draft-warn, active-fail, broken-ref)
- [ ] T046 [P] [US1] Add structural validation tests in `packages/cli/test/validation/structural-validation.test.ts`
- [ ] T047 [P] [US1] Add status-aware rule tests in `packages/cli/test/validation/status-aware-rules.test.ts` covering Draft warnings vs Active failures

### Implementation for User Story 1

- [ ] T048 [US1] Create finding types in `packages/cli/src/validation/ValidationFinding.ts` (severity, code, primitiveType, primitiveId, field, message)
- [ ] T049 [US1] Implement structural checks in `packages/cli/src/validation/StructuralValidation.ts` (duplicate IDs, broken refs, missing required fields)
- [ ] T050 [US1] Implement per-type Active rules in `packages/cli/src/validation/rules/` (split files per primitive type per FR-010–FR-026)
- [ ] T051 [US1] Implement status-aware evaluator in `packages/cli/src/validation/StatusAwareValidation.ts` (Draft→warning, Active→failure, Deprecated exemptions)
- [ ] T052 [US1] Compose `ValidationService` in `packages/cli/src/validation/ValidationService.ts` returning `ValidationResult`
- [ ] T053 [US1] Add validation JSON encoder in `packages/cli/src/validation/ValidationReport.ts` matching `specs/001-product-primitives-v0/contracts/output-artifacts.md`
- [ ] T054 [US1] Implement stdout validation renderer in `packages/cli/src/cli/render/ValidationOutput.ts`
- [ ] T055 [US1] Wire `--validate-only` path in `packages/cli/src/cli/CheckCommand.ts` using `@effect/cli`
- [ ] T056 [US1] Create Node entrypoint in `packages/cli/src/bin.ts` running `CheckCommand` via `@effect/platform-node`

**Checkpoint**: `specable check <fixture> --validate-only` prints status, failures, and warnings; exit code 1 on Active failures.

---

## Phase 4: User Story 2 — Inspect Graph Relationship Integrity (Priority: P2)

**Goal**: Integrity report for missing links, orphans, duplicate names/triples, and advisory quality warnings.

**Independent Test**: Engineered fixtures surface orphan capability, duplicate story triple, duplicate names, and persona evidence warnings.

### Tests for User Story 2

- [ ] T057 [P] [US2] Add integrity fixtures in `packages/cli/test/fixtures/integrity/` (orphan, duplicate-name, duplicate-triple, advisory)
- [ ] T058 [P] [US2] Add integrity report tests in `packages/cli/test/integrity/integrity-report.test.ts`
- [ ] T059 [P] [US2] Add workflow derivation warning tests in `packages/cli/test/integrity/workflow-derivation.test.ts`

### Implementation for User Story 2

- [ ] T060 [US2] Create integrity finding types in `packages/cli/src/integrity/IntegrityFinding.ts`
- [ ] T061 [US2] Implement duplicate name and likely-duplicate detection in `packages/cli/src/integrity/DuplicateDetection.ts`
- [ ] T062 [US2] Implement duplicate Active story triple detection in `packages/cli/src/integrity/StoryTripleDetection.ts`
- [ ] T063 [US2] Implement orphan/under-linked detection in `packages/cli/src/integrity/OrphanDetection.ts`
- [ ] T064 [US2] Implement advisory heuristics in `packages/cli/src/integrity/AdvisoryRules.ts` (capability breadth, domain concept implementation-shaped names, vague expected results, persona evidence)
- [ ] T065 [US2] Implement workflow Expected Result / Domain Concept derivability checks in `packages/cli/src/integrity/WorkflowDerivation.ts`
- [ ] T066 [US2] Compose `IntegrityService` in `packages/cli/src/integrity/IntegrityService.ts`
- [ ] T067 [US2] Add integrity JSON/Markdown encoders in `packages/cli/src/integrity/IntegrityReport.ts`
- [ ] T068 [US2] Implement stdout integrity renderer in `packages/cli/src/cli/render/IntegrityOutput.ts`
- [ ] T069 [US2] Wire `--integrity-only` mode in `packages/cli/src/cli/CheckCommand.ts`

**Checkpoint**: `--integrity-only` reports triple duplicates and advisory warnings with correct severity.

---

## Phase 5: User Story 3 — Generate Human-Readable Product Summary (Priority: P3)

**Goal**: Deterministic Markdown summary, story text generation, default full `check` command, and `--out` artifacts.

**Independent Test**: Unchanged graph produces byte-identical `summary.md`; gaps listed; stored vs generated story text handled correctly.

### Tests for User Story 3

- [ ] T070 [P] [US3] Add story text template tests in `packages/cli/test/story/story-text.test.ts`
- [ ] T071 [P] [US3] Add summary determinism tests in `packages/cli/test/summary/summary-generator.test.ts`
- [ ] T072 [P] [US3] Add CLI output artifact tests in `packages/cli/test/cli/check-output.test.ts` (`--out` files, stdout preview, exit codes)

### Implementation for User Story 3

- [ ] T073 [US3] Implement deterministic story text generator in `packages/cli/src/story/StoryText.ts` (`As a {Actor}, I can {Capability} so that {Expected Result}.`)
- [ ] T074 [US3] Implement summary section builders in `packages/cli/src/summary/SummarySections.ts` (objectives, workflows, actors/personas, capabilities, domain concepts, expected results, stories, gaps)
- [ ] T075 [US3] Implement `SummaryGenerator` in `packages/cli/src/summary/SummaryGenerator.ts` with failure/warning gap sections
- [ ] T076 [US3] Implement summary preview truncation in `packages/cli/src/summary/SummaryPreview.ts` for stdout
- [ ] T077 [US3] Implement artifact writers in `packages/cli/src/cli/output/ArtifactWriter.ts` (`summary.md`, `validation.json`, `integrity-report.json`, `integrity-report.md`, `check-result.json`)
- [ ] T078 [US3] Implement combined stdout orchestration in `packages/cli/src/cli/render/CheckOutput.ts` (deterministic section order)
- [ ] T079 [US3] Complete default `check` command and flags (`--summary-only`, `--out`) in `packages/cli/src/cli/CheckCommand.ts` per `specs/001-product-primitives-v0/contracts/cli-commands.md`
- [ ] T080 [US3] Export public library APIs from generated `packages/cli/src/index.ts` via `pnpm codegen`

**Checkpoint**: Default `specable check` prints validation + integrity + preview; `--out` writes artifacts; SC-007 determinism tests pass.

---

## Phase 6: User Story 4 — Learn the Model from Example Graphs (Priority: P4)

**Goal**: Ship generic and CoachBridge-inspired synthetic examples with valid/invalid variants and comprehension docs.

**Independent Test**: Examples run offline through full `check` without external docs or credentials.

### Tests for User Story 4

- [ ] T081 [P] [US4] Add example graph integration tests in `packages/cli/test/examples/examples.test.ts` (generic + coachbridge valid/invalid)

### Implementation for User Story 4

- [ ] T082 [P] [US4] Create generic valid graph fixtures in `packages/cli/examples/generic/valid/` (all nine type YAML files + optional `graph.yaml`)
- [ ] T083 [P] [US4] Create generic invalid graph fixtures in `packages/cli/examples/generic/invalid/` demonstrating Draft warnings and Active failures
- [ ] T084 [P] [US4] Create CoachBridge-inspired valid fixtures in `packages/cli/examples/coachbridge-synthetic/valid/` using fictional data only
- [ ] T085 [P] [US4] Create CoachBridge-inspired invalid fixtures in `packages/cli/examples/coachbridge-synthetic/invalid/`
- [ ] T086 [US4] Write comprehension checklist and usage notes in `packages/cli/examples/generic/README.md` for SC-005
- [ ] T087 [US4] Write synthetic-data disclaimer and scenario notes in `packages/cli/examples/coachbridge-synthetic/README.md`

**Checkpoint**: Quickstart commands in `specs/001-product-primitives-v0/quickstart.md` succeed against bundled examples.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build pipeline, docs, and quality gates across all stories.

- [ ] T088 [P] Configure package build pipeline in `packages/cli/package.json` (`build-esm`, `build-cjs`, `build-annotate`, `pack-v2`) and verify `pnpm build`
- [ ] T089 Run full root validation suite and fix issues (`pnpm codegen && pnpm check && pnpm lint && pnpm test && pnpm build`)
- [ ] T090 [P] Add coverage thresholds or smoke run documenting `pnpm coverage` in `README.md`
- [ ] T091 Validate quickstart scenarios documented in `specs/001-product-primitives-v0/quickstart.md`
- [ ] T092 [P] Update `README.md` with installed CLI usage (`pnpm --filter @specable/cli exec specable check ...`)
- [ ] T093 Run `pnpm exec fallow audit --base main --format json --quiet` and resolve actionable findings
- [ ] T094 Add initial Changeset for `@specable/cli` v0 in `.changeset/` if publishing is enabled

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **User Stories (Phases 3–6)**: Depend on Foundational
  - **US1 (Phase 3)**: MVP — complete first
  - **US2 (Phase 4)**: Builds on validation types/graph; independently testable via `--integrity-only`
  - **US3 (Phase 5)**: Depends on validation + integrity outputs for gap sections; completes default `check`
  - **US4 (Phase 6)**: Can parallelize fixture authoring once US1–US3 behaviors exist; tests require prior phases
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

| Story | Depends on | Independent test surface |
|-------|------------|--------------------------|
| US1 | Foundational | `--validate-only` |
| US2 | Foundational (+ validation for broken refs) | `--integrity-only` |
| US3 | US1 + US2 findings for gaps | default `check`, `--summary-only`, `--out` |
| US4 | US1–US3 | bundled `examples/*` |

### Within Each User Story

- Tests SHOULD be written to fail before implementation (red-green where practical)
- Domain/graph modules before services
- Services before CLI wiring
- Story complete before next priority unless staffed in parallel on non-overlapping files

### Parallel Opportunities

- **Phase 1**: T003–T013, T014–T021 can run in parallel after T001–T002
- **Phase 2**: Primitive schema tasks T027–T035 in parallel; test tasks T042–T043 in parallel after loader exists
- **US1**: Test fixture tasks T045–T047 in parallel; rule files inside T050 can split by primitive type
- **US2**: T057–T059 in parallel; T061–T065 in parallel after T060
- **US3**: T070–T072 in parallel
- **US4**: T082–T085 in parallel
- **Phase 7**: T088, T090, T092 in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel test setup (after foundational loader exists):
T045 → packages/cli/test/fixtures/validation/
T046 → packages/cli/test/validation/structural-validation.test.ts
T047 → packages/cli/test/validation/status-aware-rules.test.ts

# Parallel rule implementation (after T048):
packages/cli/src/validation/rules/objective-rules.ts
packages/cli/src/validation/rules/story-rules.ts
packages/cli/src/validation/rules/capability-rules.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `specable check examples/... --validate-only`
5. Demo MVP before integrity/summary expansion

### Incremental Delivery

1. Setup + Foundational → graph loading ready
2. US1 → validate locally → demo
3. US2 → integrity report → demo
4. US3 → full `check` + `--out` → demo
5. US4 → examples + docs → demo
6. Polish → CI/release ready

### Suggested MVP Scope

**Phases 1–3 (T001–T056)** deliver the constitution-aligned MVP: local fixture validation with status-aware canonical rules and CLI `--validate-only`.

---

## Task Summary

| Phase | Task IDs | Count |
|-------|----------|-------|
| Setup | T001–T022 | 22 |
| Foundational | T023–T044 | 22 |
| US1 Validate | T045–T056 | 12 |
| US2 Integrity | T057–T069 | 13 |
| US3 Summary | T070–T080 | 11 |
| US4 Examples | T081–T087 | 7 |
| Polish | T088–T094 | 7 |
| **Total** | **T001–T094** | **94** |

**Format validation**: All tasks use `- [ ]`, sequential IDs, story labels on story phases, and explicit file paths.
