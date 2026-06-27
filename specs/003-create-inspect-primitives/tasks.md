---
description: "Task list for Create and Inspect Primitives"
---

# Tasks: Create and Inspect Primitives

**Input**: Design documents from `/specs/003-create-inspect-primitives/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required per spec FR-020 and SC-006 — storage round-trip and `PrimitiveService` contract tests in `@specable/core`; CLI wiring and output tests in `@specable/cli`.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1]–[US3]) for story phases only
- Every task includes an exact file path

## Path Conventions

- **Domain package**: `packages/domain/src/` (unchanged primitive schemas)
- **Core package**: `packages/core/src/primitive/`, `packages/core/src/storage/`, `packages/core/test/`
- **CLI package**: `packages/cli/src/cli/` (thin adapters), `packages/cli/test/cli/`
- **Repository root**: changesets, docs

## Implementation conventions

Per constitution v1.3.0, [plan.md](./plan.md), and
[effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md):

- **Never use `any`**: Schema-inferred types for DTOs and tagged errors in `@specable/core`.
- **Avoid type casts**: Decode via `Schema.decodeUnknown` at storage and service boundaries (`SchemaDecode.ts` pattern).
- **Hide storage I/O**: CLI commands depend on `PrimitiveService` only; JSON/SQLite mechanics stay in `packages/core/src/storage/`.
- **Import safety**: `@specable/core` MUST NOT execute CLI or acquire live resources on import.
- **Layer composition**: Core exports `PrimitiveService.Default` and storage Live Layers; `packages/cli/src/services/Layers.ts` and `bin.ts` compose the full stack.
- **Requirements (`R`)**: Public service methods use `R = never` when platform deps are absorbed at Layer build.
- **Tests**: `@effect/vitest` `it.effect` with `Effect.provide` and temp-directory fixtures — no floating Requirements.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare module layout and release metadata for primitive CRUD extending existing `@specable/core` and `@specable/cli` packages.

**Goal**: Directory structure and changeset in place before foundational storage work.

**Checkpoint**: `packages/core/src/primitive/` exists; changeset staged for publishable packages.

- [x] T001 Create `packages/core/src/primitive/` module directory per plan.md (`PrimitiveService.ts`, `CreateInput.ts`, `PrimitiveSummary.ts`, `errors.ts`, `assignPrimitiveId.ts` placeholders acceptable until Phase 2)
- [x] T002 [P] Add changeset for `@specable/core` and `@specable/cli` primitive create/list/get in `.changeset/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend storage contract, DTOs, schema registry, ID assignment, and `PrimitiveService` skeleton — blocks all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

**Goal**: Core library can persist and read primitives through `StorageBackend` on both JSON and SQLite backends; `describe` supports non-empty graphs.

**Checkpoint**: Foundation ready — storage CRUD callable from tests via `RoutedStorageBackendLive`; `PrimitiveService` tag exported.

- [ ] T003 [P] Implement `AlphaPrimitiveType` literal union and `PrimitiveSummary` Schema in `packages/core/src/primitive/PrimitiveSummary.ts` per `data-model.md`
- [ ] T004 [P] Implement `CreateInput` Schema in `packages/core/src/primitive/CreateInput.ts` per `contracts/primitive-operations.md`
- [ ] T005 [P] Implement tagged primitive errors in `packages/core/src/primitive/errors.ts` per `research.md` R10
- [ ] T006 [P] Implement type→Schema registry in `packages/core/src/storage/PrimitiveSchemas.ts` per `research.md` R5 (eight alpha create types + decode-only CapabilityConceptLink)
- [ ] T007 [P] Implement ID assignment helper in `packages/core/src/primitive/assignPrimitiveId.ts` per `research.md` R1
- [ ] T008 Extend `StorageBackend` contract with `create`, `list`, `get` in `packages/core/src/storage/StorageBackend.ts` per `contracts/storage-crud.md`
- [ ] T009 [P] Update `describe` for non-empty graph counts in `packages/core/src/storage/JsonStorageBackend.ts`
- [ ] T010 [P] Implement `create`, `list`, `get` in `packages/core/src/storage/JsonStorageBackend.ts` per `contracts/storage-crud.md` and `research.md` R6
- [ ] T011 [P] Update `describe` for non-empty graph counts in `packages/core/src/storage/SqliteStorageBackend.ts`
- [ ] T012 [P] Implement `create`, `list`, `get` in `packages/core/src/storage/SqliteStorageBackend.ts` per `contracts/storage-crud.md` and `research.md` R7
- [ ] T013 Route `create`, `list`, `get` in `packages/core/src/storage/RoutedStorageBackend.ts`
- [ ] T014 Implement `PrimitiveService` Effect service skeleton in `packages/core/src/primitive/PrimitiveService.ts` with `create`, `list`, `get` method signatures
- [ ] T015 Run `pnpm --filter @specable/core run codegen` and commit generated `packages/core/src/index.ts`
- [ ] T016 [P] Create primitive test helpers in `packages/core/test/fixtures/primitive/helpers.ts` (init temp JSON/SQLite roots, synthetic create inputs)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Create a Product Primitive (Priority: P1) 🎯 MVP

**Goal**: CLI `specable primitive create <path>` persists primitives with system-assigned IDs on JSON and SQLite roots; validation errors are field-path aware.

**Independent Test**: Init JSON and SQLite roots, create Capability and Actor primitives, verify stable IDs and failure paths per `quickstart.md`.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US1] JSON create round-trip test in `packages/core/test/storage/create-json.test.ts` (Capability + Actor, `--set` optional field)
- [ ] T018 [P] [US1] SQLite create round-trip test in `packages/core/test/storage/create-sqlite.test.ts`
- [ ] T019 [P] [US1] Create failure tests in `packages/core/test/primitive/create-failures.test.ts` (unknown type, invalid fields, missing root, duplicate ID)

### Implementation for User Story 1

- [ ] T020 [US1] Implement `PrimitiveService.create` in `packages/core/src/primitive/PrimitiveService.ts` (manifest read, ID assign, Schema decode, delegate storage)
- [ ] T021 [P] [US1] Implement `PrimitiveCreateCommand` in `packages/cli/src/cli/PrimitiveCreateCommand.ts` with `--type`, `--name`, `--status`, repeatable `--set` per `contracts/cli-commands.md`
- [ ] T022 [P] [US1] Implement create stdout renderer in `packages/cli/src/cli/render/PrimitiveOutput.ts`
- [ ] T023 [US1] Register `primitive create` subcommand in `packages/cli/src/cli/RootCommand.ts`
- [ ] T024 [US1] Compose `PrimitiveServiceLive` in `packages/cli/src/services/Layers.ts` and register primitive error handlers in `packages/cli/src/bin.ts`
- [ ] T025 [P] [US1] CLI create wiring test in `packages/cli/test/cli/primitive-create-command.test.ts` (flags, exit codes, stdout shape)

**Checkpoint**: User Story 1 independently testable — create on JSON and SQLite roots via CLI and core tests.

---

## Phase 4: User Story 2 — List Primitives in a Project Root (Priority: P2)

**Goal**: CLI `specable primitive list <path> [--type <type>]` returns summary records with stable IDs; empty roots succeed with zero results.

**Independent Test**: Create multiple primitives, list with and without filter; verify filter excludes non-matching types per `quickstart.md`.

### Tests for User Story 2

- [ ] T026 [P] [US2] JSON list all and type-filter tests in `packages/core/test/storage/list-json.test.ts`
- [ ] T027 [P] [US2] SQLite list tests in `packages/core/test/storage/list-sqlite.test.ts`
- [ ] T028 [P] [US2] List failure tests in `packages/core/test/primitive/list-failures.test.ts` (invalid root, invalid filter type, empty root)

### Implementation for User Story 2

- [ ] T029 [US2] Implement `PrimitiveService.list` in `packages/core/src/primitive/PrimitiveService.ts` with stable sort order per `contracts/primitive-operations.md`
- [ ] T030 [P] [US2] Implement list stdout renderer in `packages/cli/src/cli/render/PrimitiveOutput.ts`
- [ ] T031 [US2] Implement `PrimitiveListCommand` in `packages/cli/src/cli/PrimitiveListCommand.ts`
- [ ] T032 [US2] Register `primitive list` subcommand in `packages/cli/src/cli/RootCommand.ts`
- [ ] T033 [P] [US2] CLI list wiring test in `packages/cli/test/cli/primitive-list-command.test.ts`

**Checkpoint**: User Stories 1 and 2 independently testable — create and list on both backends.

---

## Phase 5: User Story 3 — Get a Primitive by ID (Priority: P3)

**Goal**: CLI `specable primitive get <path> --id <id>` returns canonical read projection; JSON and SQLite backends expose semantically equivalent records.

**Independent Test**: Create primitive, get by ID, confirm full round-trip; verify not-found and cross-backend parity per `quickstart.md` SC-002 and SC-005.

### Tests for User Story 3

- [ ] T034 [P] [US3] JSON get round-trip test in `packages/core/test/storage/get-json.test.ts`
- [ ] T035 [P] [US3] SQLite get round-trip test in `packages/core/test/storage/get-sqlite.test.ts`
- [ ] T036 [P] [US3] Get not-found and cross-backend parity test in `packages/core/test/primitive/get-parity.test.ts`

### Implementation for User Story 3

- [ ] T037 [US3] Implement `PrimitiveService.get` in `packages/core/src/primitive/PrimitiveService.ts`
- [ ] T038 [P] [US3] Implement get stdout renderer in `packages/cli/src/cli/render/PrimitiveOutput.ts` with stable field order per `contracts/cli-commands.md`
- [ ] T039 [US3] Implement `PrimitiveGetCommand` in `packages/cli/src/cli/PrimitiveGetCommand.ts`
- [ ] T040 [US3] Register `primitive get` subcommand in `packages/cli/src/cli/RootCommand.ts`
- [ ] T041 [P] [US3] CLI get wiring test in `packages/cli/test/cli/primitive-get-command.test.ts`

**Checkpoint**: All user stories independently functional — full create/list/get loop on both backends.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Inspect regression, documentation, milestone links, and release validation.

**Goal**: `project show` works on non-empty roots; quickstart demo passes; CI gates green.

**Checkpoint**: Milestone acceptance criteria satisfied; ready for merge.

- [ ] T042 [P] Update inspect tests for non-empty graph in `packages/core/test/project/inspect-json.test.ts` and `packages/core/test/project/inspect-sqlite.test.ts` (if separate)
- [ ] T043 Run full `quickstart.md` demo flow manually and fix any gaps in contracts or CLI messages
- [ ] T044 [P] Update Spec Kit link from TBD in `docs/milestones/create-inspect-primitives.md` to `specs/003-create-inspect-primitives/spec.md`
- [ ] T045 [P] Update `AGENTS.md` repository structure and commands section for `specable primitive` commands
- [ ] T046 Verify v0 regression: `specable check packages/cli/examples/generic/valid` unchanged
- [ ] T047 Run `pnpm codegen`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build` from repository root
- [ ] T048 Run `pnpm exec fallow audit --base main --format json --quiet` and resolve findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational; practically needs US1 create for meaningful list demos but core list tests can seed via storage directly
- **User Story 3 (Phase 5)**: Depends on Foundational; core get tests can use storage `create` directly; CLI E2E assumes US1 create works
- **Polish (Phase 6)**: Depends on US1–US3 completion

### User Story Dependencies

```text
Phase 1 Setup → Phase 2 Foundational
                    ↓
              Phase 3 US1 (Create) ──────┐
                    ↓                  │
              Phase 4 US2 (List) ←─────┤ (core tests independent; CLI demo needs create)
                    ↓                  │
              Phase 5 US3 (Get) ←────────┘
                    ↓
              Phase 6 Polish
```

- **US1 (P1)**: No dependency on US2/US3
- **US2 (P2)**: Core list tests use storage layer directly; CLI list demo assumes US1
- **US3 (P3)**: Core get tests use storage layer directly; full CLI loop assumes US1

### Within Each User Story

- Tests MUST fail before implementation
- Core service logic before CLI adapters
- Layer composition in `Layers.ts` / `bin.ts` after commands exist
- Story checkpoint before next priority

### Parallel Opportunities

- **Phase 1**: T002 parallel with T001
- **Phase 2**: T003–T007, T009–T012, T016 in parallel groups; T013 after T010+T012; T014 after T008; T015 after T014
- **Phase 3**: T017–T019 parallel; T021+T022+T025 parallel after T020
- **Phase 4**: T026–T028 parallel; T030+T033 parallel after T029
- **Phase 5**: T034–T036 parallel; T038+T041 parallel after T037
- **Phase 6**: T042, T044, T045 parallel

---

## Parallel Example: User Story 1

```bash
# Core create tests together (after Phase 2):
T017: packages/core/test/storage/create-json.test.ts
T018: packages/core/test/storage/create-sqlite.test.ts
T019: packages/core/test/primitive/create-failures.test.ts

# After T020 completes:
T021: packages/cli/src/cli/PrimitiveCreateCommand.ts
T022: packages/cli/src/cli/render/PrimitiveOutput.ts
T025: packages/cli/test/cli/primitive-create-command.test.ts
```

---

## Parallel Example: Foundational Phase

```bash
# DTOs, errors, registry (no cross-deps):
T003: packages/core/src/primitive/PrimitiveSummary.ts
T004: packages/core/src/primitive/CreateInput.ts
T005: packages/core/src/primitive/errors.ts
T006: packages/core/src/storage/PrimitiveSchemas.ts
T007: packages/core/src/primitive/assignPrimitiveId.ts

# Storage backends (after T008):
T009+T010: packages/core/src/storage/JsonStorageBackend.ts
T011+T012: packages/core/src/storage/SqliteStorageBackend.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `specable primitive create` on JSON and SQLite roots per `quickstart.md`
5. Demo create as alpha graph-building entry point

### Incremental Delivery

1. Setup + Foundational → storage CRUD + service skeleton ready
2. US1 → create on both backends → **MVP**
3. US2 → list with optional type filter
4. US3 → get completes create–list–get loop + parity tests
5. Polish → inspect non-empty roots, quickstart, AGENTS.md, CI gates

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Developer A: US1 (create + CLI)
   - Developer B: US2 core list tests + `PrimitiveService.list` while A finishes CLI create
3. US3 after US1 storage paths stable; Polish after all stories merge

---

## Notes

- Do **not** migrate v0 `GraphRepository` / `GraphLoader` into core (same boundary as milestone 002 FR-018a)
- Do **not** wire `specable check` to alpha project roots this milestone
- Do **not** implement update, delete, relationships, or CapabilityConceptLink create
- Eight alpha types at create boundary; CapabilityConceptLink remains init-only empty layout
- JSON create uses temp-file + rename for atomic single-file writes
- SQLite duplicate ID → `DuplicatePrimitiveIdError` via PRIMARY KEY constraint
- Commit generated `packages/core/src/index.ts` after `pnpm codegen`
- Active-status field enforcement deferred — Draft minimum fields only at create
