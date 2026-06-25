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

- **Domain package**: `packages/domain/src/` (schemas, Schema literal unions, domain decode errors), `packages/domain/test/` (minimal encode/decode tests)
- **CLI package**: `packages/cli/src/` (graph, validation, integrity, summary, CLI), `packages/cli/test/` (comprehensive tests), `packages/cli/examples/` (bundled graphs)
- **Repository root**: CI, TS configs, ESLint, scripts, docs

## Implementation conventions

Per constitution v1.1.0 and [plan.md](./plan.md) (Session 2026-06-25):

- **Never use `any`**: Use generics, Schema types, branded IDs, or `unknown` with narrowing.
- **Avoid type casts**: Prefer generic factories and closed-over decode helpers over `as` assertions. Document and test any unavoidable cast at an external boundary.
- **Hide storage behind abstractions**: Feature modules depend on `GraphRepository`, not `GraphLoader` or filesystem code. Compose `GraphRepositoryLive` in `services/Layers.ts`.
- **Do not suppress unused-dependency findings** in Fallow for packages that should be referenced; wire dependencies or remove them.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap Effect TypeScript template conventions for a one-package monorepo (`packages/cli` only).

- [x] T001 Create root `pnpm-workspace.yaml` with `packages/*` workspace glob
- [x] T002 Create root `package.json` with scripts (`codegen`, `check`, `typecheck` alias, `lint`, `lint-fix`, `test`, `coverage`, `build`, `clean`) per `specs/001-product-primitives-v0/plan.md`
- [x] T003 [P] Create root `tsconfig.base.json` with strict settings, `@effect/language-service` plugin, and `@specable/cli` path alias
- [x] T004 [P] Create root `tsconfig.json` referencing only `packages/cli`
- [x] T005 [P] Create root `tsconfig.build.json` for publishable build graph
- [x] T006 [P] Create root `vitest.config.ts` for monorepo test discovery
- [x] T007 [P] Create root `eslint.config.mjs` with `@effect/eslint-plugin` flat config
- [x] T008 [P] Create `scripts/clean.mjs` for generated output cleanup
- [x] T009 Create `packages/cli/package.json` for `@specable/cli` with Effect dependencies, build-utils scripts, and bin entry
- [x] T010 [P] Create `packages/cli/tsconfig.json` referencing `tsconfig.src.json` and `tsconfig.test.json`
- [x] T011 [P] Create `packages/cli/tsconfig.src.json` for `src/` compilation
- [x] T012 [P] Create `packages/cli/tsconfig.test.json` for `test/` compilation
- [x] T013 [P] Create `packages/cli/tsconfig.build.json` for package build output
- [x] T014 [P] Create `.fallowrc.json` scoped to `packages/cli` only
- [x] T015 [P] Create `.changeset/config.json` with repo `PathableAI-org/SpecAble`
- [x] T016 [P] Create `.github/actions/setup/action.yml` with pnpm frozen lockfile install
- [x] T017 [P] Create `.github/workflows/check.yml` (codegen, build, source-state, check, lint, test)
- [x] T018 [P] Create `.github/workflows/fallow-audit.yml` for PR audit and dupes jobs
- [x] T019 [P] Create `.github/workflows/release.yml` with Changesets publish flow
- [x] T020 [P] Create `.github/workflows/snapshot.yml` with pkg.pr.new skip-on-missing-app pattern
- [x] T021 [P] Create `AGENTS.md` adapted from effect-typescript-template for single-package SpecAble layout
- [x] T022 Create root `README.md` with commands, package layout, Effect guidance, publishing, and template adaptation sections

**Checkpoint**: `pnpm install`, `pnpm check`, and `pnpm lint` run (may be empty package).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `@specable/domain` package (Schema-only primitive models), `@specable/cli` graph loading, and test harness — MUST complete before user story work.

**⚠️ CRITICAL**: No user story implementation until this phase is complete.

### Domain package scaffolding

- [X] T023 Create `packages/domain/package.json` for `@specable/domain` with `effect`/`@effect/schema` and `@effect/build-utils` scripts (no CLI, platform, or YAML dependencies)
- [X] T024 [P] Create `packages/domain/tsconfig.json`, `packages/domain/tsconfig.src.json`, `packages/domain/tsconfig.test.json`, and `packages/domain/tsconfig.build.json`
- [X] T025 Update root `tsconfig.base.json` with `@specable/domain` path alias alongside `@specable/cli`
- [X] T026 Update root `tsconfig.json` and `tsconfig.build.json` to reference `packages/domain` and `packages/cli` (cli references domain)
- [X] T027 Add `@specable/domain` workspace dependency to `packages/cli/package.json`
- [X] T028 Update `.fallowrc.json` to scope both `packages/domain` and `packages/cli`

### Domain schemas (`@specable/domain` — Schema-only, no native `enum`)

- [X] T029 Create Schema literal unions in `packages/domain/src/unions/` (`Status`, `ActorCategory`, `ConceptRole`, `ConceptImportance`, `PersonaConfidence`, `ReferenceRole`) using `Schema.Literal` — no native TypeScript `enum`
- [X] T030 [P] Create reference schema in `packages/domain/src/Reference.ts` (id + optional role) with Schema annotations
- [X] T031 [P] Create `FixtureDecodeError` in `packages/domain/src/errors.ts` (domain YAML/Schema decode boundary only)
- [X] T032 [P] Create base primitive schema in `packages/domain/src/PrimitiveBase.ts` (`id`, `name`, `status`, shared fields) with Schema annotations for semantic meaning
- [X] T033 [P] Create Objective schema in `packages/domain/src/primitives/Objective.ts`
- [X] T034 [P] Create Actor schema in `packages/domain/src/primitives/Actor.ts`
- [X] T035 [P] Create Persona schema in `packages/domain/src/primitives/Persona.ts`
- [X] T036 [P] Create DomainConcept schema in `packages/domain/src/primitives/DomainConcept.ts`
- [X] T037 [P] Create Capability schema in `packages/domain/src/primitives/Capability.ts`
- [X] T038 [P] Create CapabilityConceptLink schema in `packages/domain/src/primitives/CapabilityConceptLink.ts`
- [X] T039 [P] Create ExpectedResult schema in `packages/domain/src/primitives/ExpectedResult.ts`
- [X] T040 [P] Create Workflow schema in `packages/domain/src/primitives/Workflow.ts`
- [X] T041 [P] Create Story schema in `packages/domain/src/primitives/Story.ts`
- [X] T042 Create primitive union and type exports in `packages/domain/src/primitives/index.ts`
- [X] T043 Run `@effect/build-utils` codegen in `packages/domain/package.json` and generate exports via `pnpm --filter @specable/domain run codegen`

### CLI graph layer (`@specable/cli` — consumes domain schemas)

- [X] T044 [P] Create CLI-layer tagged errors in `packages/cli/src/errors.ts` (`GraphProjectNotFoundError`, `DuplicateIdError`, `BrokenReferenceError`, `ValidationFailedError`, `OutputWriteError`)
- [X] T045 Create `ProductGraph` and `GraphIndex` types in `packages/cli/src/graph/ProductGraph.ts` using decoded `@specable/domain` types
- [X] T046 Create fixture filename registry in `packages/cli/src/graph/FixtureFiles.ts` per `specs/001-product-primitives-v0/contracts/fixture-format.md`
- [X] T047 Create JSON decode helpers in `packages/cli/src/graph/JsonDecode.ts` (parse + Schema decode with file paths via domain schemas)
- [X] T048 Implement `GraphLoader` service Layer in `packages/cli/src/graph/GraphLoader.ts` (load per-type files, missing file → empty, build index)
- [X] T049 Create `FileSystem`/`GraphRepositoryLive` Layer wiring in `packages/cli/src/services/Layers.ts` using `@effect/platform-node` (`GraphLoader` composed internally; consumers use `GraphRepository`)

### Tests and CLI codegen

- [ ] T050 [P] Add minimal schema encode/decode tests in `packages/domain/test/schema-decode.test.ts` (complex compositions only per FR-059)
- [X] T051 [P] Add loader integration tests in `packages/cli/test/graph/graph-loader.test.ts` (missing type file, broken JSON, fixture decode via domain schemas)
- [ ] T052 Run `@effect/build-utils` codegen in `packages/cli/package.json`, update root `package.json` scripts for both packages, and generate exports via `pnpm codegen`

**Checkpoint**: `@specable/domain` builds and exports schemas; graph loads synthetic test fixtures in `@specable/cli`; domain decode tests and loader tests pass.

---

## Phase 3: User Story 1 — Validate a Local Primitive Graph (Priority: P1) 🎯 MVP

**Goal**: Status-aware validation of required fields, broken references, and Active canonical rules with actionable findings.

**Independent Test**: Run validation against mixed Draft/Active/Deprecated fixtures; distinguish warnings vs failures; no network required.

### Tests for User Story 1

- [ ] T053 [P] [US1] Add validation fixture helpers in `packages/cli/test/fixtures/validation/` (valid, draft-warn, active-fail, broken-ref)
- [ ] T054 [P] [US1] Add structural validation tests in `packages/cli/test/validation/structural-validation.test.ts`
- [ ] T055 [P] [US1] Add status-aware rule tests in `packages/cli/test/validation/status-aware-rules.test.ts` covering Draft warnings vs Active failures

### Implementation for User Story 1

- [ ] T056 [US1] Create finding types in `packages/cli/src/validation/ValidationFinding.ts` (severity, code, primitiveType, primitiveId, field, message)
- [ ] T057 [US1] Implement structural checks in `packages/cli/src/validation/StructuralValidation.ts` (duplicate IDs, broken refs, missing required fields)
- [ ] T058 [US1] Implement per-type Active rules in `packages/cli/src/validation/rules/` (split files per primitive type per FR-010–FR-026)
- [ ] T059 [US1] Implement status-aware evaluator in `packages/cli/src/validation/StatusAwareValidation.ts` (Draft→warning, Active→failure, Deprecated exemptions)
- [ ] T060 [US1] Compose `ValidationService` in `packages/cli/src/validation/ValidationService.ts` returning `ValidationResult`
- [ ] T061 [US1] Add validation JSON encoder in `packages/cli/src/validation/ValidationReport.ts` matching `specs/001-product-primitives-v0/contracts/output-artifacts.md`
- [ ] T062 [US1] Implement stdout validation renderer in `packages/cli/src/cli/render/ValidationOutput.ts`
- [ ] T063 [US1] Wire `--validate-only` path in `packages/cli/src/cli/CheckCommand.ts` using `@effect/cli`
- [ ] T064 [US1] Create Node entrypoint in `packages/cli/src/bin.ts` running `CheckCommand` via `@effect/platform-node`

**Checkpoint**: `specable check <fixture> --validate-only` prints status, failures, and warnings; exit code 1 on Active failures.

---

## Phase 4: User Story 2 — Inspect Graph Relationship Integrity (Priority: P2)

**Goal**: Integrity report for missing links, orphans, duplicate names/triples, and advisory quality warnings.

**Independent Test**: Engineered fixtures surface orphan capability, duplicate story triple, duplicate names, and persona evidence warnings.

### Tests for User Story 2

- [ ] T065 [P] [US2] Add integrity fixtures in `packages/cli/test/fixtures/integrity/` (orphan, duplicate-name, duplicate-triple, advisory)
- [ ] T066 [P] [US2] Add integrity report tests in `packages/cli/test/integrity/integrity-report.test.ts`
- [ ] T067 [P] [US2] Add workflow derivation warning tests in `packages/cli/test/integrity/workflow-derivation.test.ts`

### Implementation for User Story 2

- [ ] T068 [US2] Create integrity finding types in `packages/cli/src/integrity/IntegrityFinding.ts`
- [ ] T069 [US2] Implement duplicate name and likely-duplicate detection in `packages/cli/src/integrity/DuplicateDetection.ts`
- [ ] T070 [US2] Implement duplicate Active story triple detection in `packages/cli/src/integrity/StoryTripleDetection.ts`
- [ ] T071 [US2] Implement orphan/under-linked detection in `packages/cli/src/integrity/OrphanDetection.ts`
- [ ] T072 [US2] Implement advisory heuristics in `packages/cli/src/integrity/AdvisoryRules.ts` (capability breadth, domain concept implementation-shaped names, vague expected results, persona evidence)
- [ ] T073 [US2] Implement workflow Expected Result / Domain Concept derivability checks in `packages/cli/src/integrity/WorkflowDerivation.ts`
- [ ] T074 [US2] Compose `IntegrityService` in `packages/cli/src/integrity/IntegrityService.ts`
- [ ] T075 [US2] Add integrity JSON/Markdown encoders in `packages/cli/src/integrity/IntegrityReport.ts`
- [ ] T076 [US2] Implement stdout integrity renderer in `packages/cli/src/cli/render/IntegrityOutput.ts`
- [ ] T077 [US2] Wire `--integrity-only` mode in `packages/cli/src/cli/CheckCommand.ts`

**Checkpoint**: `--integrity-only` reports triple duplicates and advisory warnings with correct severity.

---

## Phase 5: User Story 3 — Generate Human-Readable Product Summary (Priority: P3)

**Goal**: Deterministic Markdown summary, story text generation, default full `check` command, and `--out` artifacts.

**Independent Test**: Unchanged graph produces byte-identical `summary.md`; gaps listed; stored vs generated story text handled correctly.

### Tests for User Story 3

- [ ] T078 [P] [US3] Add story text template tests in `packages/cli/test/story/story-text.test.ts`
- [ ] T079 [P] [US3] Add summary determinism tests in `packages/cli/test/summary/summary-generator.test.ts`
- [ ] T080 [P] [US3] Add CLI output artifact tests in `packages/cli/test/cli/check-output.test.ts` (`--out` files, stdout preview, exit codes)

### Implementation for User Story 3

- [ ] T081 [US3] Implement deterministic story text generator in `packages/cli/src/story/StoryText.ts` (`As a {Actor}, I can {Capability} so that {Expected Result}.`)
- [ ] T082 [US3] Implement summary section builders in `packages/cli/src/summary/SummarySections.ts` (objectives, workflows, actors/personas, capabilities, domain concepts, expected results, stories, gaps)
- [ ] T083 [US3] Implement `SummaryGenerator` in `packages/cli/src/summary/SummaryGenerator.ts` with failure/warning gap sections
- [ ] T084 [US3] Implement summary preview truncation in `packages/cli/src/summary/SummaryPreview.ts` for stdout
- [ ] T085 [US3] Implement artifact writers in `packages/cli/src/cli/output/ArtifactWriter.ts` (`summary.md`, `validation.json`, `integrity-report.json`, `integrity-report.md`, `check-result.json`)
- [ ] T086 [US3] Implement combined stdout orchestration in `packages/cli/src/cli/render/CheckOutput.ts` (deterministic section order)
- [ ] T087 [US3] Complete default `check` command and flags (`--summary-only`, `--out`) in `packages/cli/src/cli/CheckCommand.ts` per `specs/001-product-primitives-v0/contracts/cli-commands.md`
- [ ] T088 [US3] Export public library APIs from generated `packages/cli/src/index.ts` via `pnpm codegen`

**Checkpoint**: Default `specable check` prints validation + integrity + preview; `--out` writes artifacts; SC-007 determinism tests pass.

---

## Phase 6: User Story 4 — Learn the Model from Example Graphs (Priority: P4)

**Goal**: Ship generic and CoachBridge-inspired synthetic examples with valid/invalid variants and comprehension docs.

**Independent Test**: Examples run offline through full `check` without external docs or credentials.

### Tests for User Story 4

- [ ] T089 [P] [US4] Add example graph integration tests in `packages/cli/test/examples/examples.test.ts` (generic + coachbridge valid/invalid)

### Implementation for User Story 4

- [ ] T090 [P] [US4] Create generic valid graph fixtures in `packages/cli/examples/generic/valid/` (all nine type YAML files + optional `graph.yaml`)
- [ ] T091 [P] [US4] Create generic invalid graph fixtures in `packages/cli/examples/generic/invalid/` demonstrating Draft warnings and Active failures
- [ ] T092 [P] [US4] Create CoachBridge-inspired valid fixtures in `packages/cli/examples/coachbridge-synthetic/valid/` using fictional data only
- [ ] T093 [P] [US4] Create CoachBridge-inspired invalid fixtures in `packages/cli/examples/coachbridge-synthetic/invalid/`
- [ ] T094 [US4] Write comprehension checklist and usage notes in `packages/cli/examples/generic/README.md` for SC-005
- [ ] T095 [US4] Write synthetic-data disclaimer and scenario notes in `packages/cli/examples/coachbridge-synthetic/README.md`

**Checkpoint**: Quickstart commands in `specs/001-product-primitives-v0/quickstart.md` succeed against bundled examples.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build pipeline, docs, and quality gates across all stories.

- [ ] T096 [P] Configure package build pipeline in `packages/domain/package.json` (`build-esm`, `build-cjs`, `build-annotate`, `pack-v2`) and verify domain build
- [ ] T097 [P] Configure package build pipeline in `packages/cli/package.json` (`build-esm`, `build-cjs`, `build-annotate`, `pack-v2`) and verify `pnpm build`
- [ ] T098 Run full root validation suite and fix issues (`pnpm codegen && pnpm check && pnpm lint && pnpm test && pnpm build`)
- [ ] T099 [P] Add coverage thresholds or smoke run documenting `pnpm coverage` in `README.md`
- [ ] T100 Validate quickstart scenarios documented in `specs/001-product-primitives-v0/quickstart.md`
- [ ] T101 [P] Update `README.md` and `AGENTS.md` for two-package layout (`@specable/domain` + `@specable/cli`)
- [ ] T102 Run `pnpm exec fallow audit --base main --format json --quiet` and resolve actionable findings
- [ ] T103 Add initial Changeset for `@specable/domain` and `@specable/cli` v0 in `.changeset/` if publishing is enabled

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
- **Phase 2**: Domain scaffolding T024–T028 in parallel after T023; primitive schemas T033–T041 in parallel after T032; T050–T051 in parallel after T049
- **US1**: Test fixture tasks T053–T055 in parallel; rule files inside T058 can split by primitive type
- **US2**: T065–T067 in parallel; T069–T073 in parallel after T068
- **US3**: T078–T080 in parallel
- **US4**: T090–T093 in parallel
- **Phase 7**: T096, T097, T099, T101 in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel test setup (after foundational loader exists):
T053 → packages/cli/test/fixtures/validation/
T054 → packages/cli/test/validation/structural-validation.test.ts
T055 → packages/cli/test/validation/status-aware-rules.test.ts

# Parallel rule implementation (after T056):
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

**Phases 1–3 (T001–T064)** deliver the constitution-aligned MVP: local fixture validation with status-aware canonical rules and CLI `--validate-only`.

---

## Task Summary

| Phase | Task IDs | Count |
|-------|----------|-------|
| Setup | T001–T022 | 22 |
| Foundational | T023–T052 | 30 |
| US1 Validate | T053–T064 | 12 |
| US2 Integrity | T065–T077 | 13 |
| US3 Summary | T078–T088 | 11 |
| US4 Examples | T089–T095 | 7 |
| Polish | T096–T103 | 8 |
| **Total** | **T001–T103** | **103** |

**Format validation**: All tasks use `- [ ]`, sequential IDs, story labels on story phases, and explicit file paths.
