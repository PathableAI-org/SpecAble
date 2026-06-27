---
description: "Task list for Initialize JSON and SQLite Project Roots"
---

# Tasks: Initialize JSON and SQLite Project Roots

**Input**: Design documents from `/specs/002-initialize-project-roots/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required per spec FR-019 — contract and behavior tests in `@specable/core`; CLI wiring and output tests in `@specable/cli`.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1]–[US3]) for story phases only
- Every task includes an exact file path

## Path Conventions

- **Domain package**: `packages/domain/src/` (unchanged primitive schemas)
- **Core package**: `packages/core/src/` (project root, storage backends), `packages/core/test/`
- **CLI package**: `packages/cli/src/cli/` (thin adapters), `packages/cli/test/cli/`
- **Repository root**: `package.json`, `tsconfig*.json`, changesets

## Implementation conventions

Per constitution v1.1.0 and [plan.md](./plan.md):

- **Never use `any`**: Schema-inferred types for config and inspect DTOs in `@specable/core`.
- **Avoid type casts**: SQLite row decode via Schema at storage boundary in core.
- **Hide storage I/O**: CLI commands depend on `ProjectRootService` from core; JSON/SQLite Live Layers exported from `packages/core/src/storage/layers.ts`.
- **Import safety**: `@specable/core` MUST NOT execute CLI or acquire live resources on import.
- **Layer composition**: Core exports service contracts and per-backend Live Layers; `packages/cli/src/bin.ts` composes the full stack with `@effect/platform-node`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold `@specable/core` workspace package and wire monorepo tooling.

- [x] T001 Create `packages/core/package.json` for `@specable/core` with Effect, `@effect/schema`, `@effect/platform`, `@effect/sql`, `@effect/sql-sqlite-node`, `@specable/domain` workspace dependency, and build-utils scripts mirroring `packages/domain/package.json`
- [x] T002 [P] Create `packages/core/tsconfig.json`, `packages/core/tsconfig.src.json`, `packages/core/tsconfig.test.json`, and `packages/core/tsconfig.build.json` mirroring `packages/domain/` layout
- [x] T003 Update root `package.json` `codegen`, `build`, and related scripts to include `@specable/core` filter alongside domain and cli
- [x] T004 Update root `tsconfig.json` and `tsconfig.build.json` to add `packages/core` project references
- [x] T005 Add `@specable/core: workspace:*` dependency to `packages/cli/package.json`
- [x] T006 [P] Update `packages/cli/tsconfig.json` to reference `../core` project
- [x] T007 Add changeset for new `@specable/core` package in `.changeset/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schemas, storage contract, backends, and `ProjectRootService` skeleton — blocks all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 [P] Implement canonical nine-type list in `packages/core/src/storage/PrimitiveTypes.ts` per `data-model.md`
- [x] T009 [P] Implement `ProjectConfig` and `StorageBinding` Schema in `packages/core/src/project/ProjectConfig.ts` per `contracts/project-config.md`
- [x] T010 [P] Implement `GraphStoreSummary` and `ProjectDescriptor` Schema in `packages/core/src/project/ProjectDescriptor.ts` per `data-model.md`
- [x] T011 [P] Implement tagged init/inspect errors in `packages/core/src/project/errors.ts` per `research.md` R11
- [x] T012 Implement `StorageBackend` Effect service contract in `packages/core/src/storage/StorageBackend.ts` with `bootstrap` and `describe` per `research.md` R6
- [x] T013 [P] Implement JSON bootstrap and graph summary in `packages/core/src/storage/JsonStorageBackend.ts` per `contracts/storage-layouts.md`
- [x] T014 [P] Implement SQLite bootstrap and graph summary in `packages/core/src/storage/SqliteStorageBackend.ts` per `contracts/storage-layouts.md` and `research.md` R4–R5
- [x] T015 Implement `JsonStorageBackendLive` and `SqliteStorageBackendLive` in `packages/core/src/storage/layers.ts`
- [x] T016 Implement `ProjectRootService` Effect service skeleton in `packages/core/src/project/ProjectRootService.ts` with `initialize` and `describe` method signatures
- [x] T017 Run `pnpm --filter @specable/core run codegen` and commit generated `packages/core/src/index.ts`
- [x] T018 [P] Create temp-directory test helpers in `packages/core/test/fixtures/project/helpers.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Initialize a SpecAble Project Root (Priority: P1) 🎯 MVP

**Goal**: CLI `specable init <path>` creates JSON-backed (default) or SQLite-backed project roots with `specable.json`, empty graph namespace, and stable `projectId`.

**Independent Test**: Run `specable init /tmp/demo-json` (no `--storage`) and `specable init /tmp/demo-sqlite --storage sqlite`; verify `specable.json`, storage artifacts, and failure paths per `quickstart.md`.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US1] JSON init contract test in `packages/core/test/project/init-json.test.ts` (default storage, nine empty type files, `specable.json` fields)
- [ ] T020 [P] [US1] SQLite init contract test in `packages/core/test/project/init-sqlite.test.ts` (`graph.sqlite`, empty `primitives` table)
- [ ] T021 [P] [US1] Init failure tests in `packages/core/test/project/init-failures.test.ts` (re-init, non-empty dir, invalid `--storage`, permissions)

### Implementation for User Story 1

- [ ] T022 [US1] Implement `ProjectRootService.initialize` in `packages/core/src/project/ProjectRootService.ts` (UUID `projectId`, default `name` from basename, storage bootstrap, write `specable.json` last)
- [ ] T023 [P] [US1] Implement `InitCommand` in `packages/cli/src/cli/InitCommand.ts` with optional `--storage` defaulting to `json` and optional `--name` per `contracts/cli-commands.md`
- [ ] T024 [US1] Register `init` command in `packages/cli/src/cli/RootCommand.ts`
- [ ] T025 [US1] Compose `ProjectRootService` + selected storage Live Layer + platform Layers in `packages/cli/src/services/Layers.ts` and `packages/cli/src/bin.ts`
- [ ] T026 [P] [US1] CLI init wiring test in `packages/cli/test/cli/init-command.test.ts` verifying `--storage` defaults to `json` and success stdout shape

**Checkpoint**: User Story 1 independently testable — init JSON (default) and SQLite roots via CLI.

---

## Phase 4: User Story 2 — Inspect Project Root Configuration (Priority: P2)

**Goal**: CLI `specable project show <path>` reports canonical `projectId`, display `name`, storage binding, primitive types, and empty graph state.

**Independent Test**: Init roots from US1, run `specable project show` on each; verify field order and failures per `quickstart.md`.

### Tests for User Story 2

- [ ] T027 [P] [US2] Inspect descriptor contract test in `packages/core/test/project/inspect-json.test.ts` for JSON-backed root
- [ ] T028 [P] [US2] Inspect failure tests in `packages/core/test/project/inspect-failures.test.ts` (missing `specable.json`, decode error, incomplete storage, legacy v0 fixture dir)

### Implementation for User Story 2

- [ ] T029 [US2] Implement `ProjectRootService.describe` in `packages/core/src/project/ProjectRootService.ts` returning `ProjectDescriptor` with `GraphStoreSummary` from active backend
- [ ] T030 [P] [US2] Implement stdout renderer in `packages/cli/src/cli/render/ProjectShowOutput.ts` with stable field order per `contracts/cli-commands.md`
- [ ] T031 [US2] Implement `ProjectShowCommand` in `packages/cli/src/cli/ProjectShowCommand.ts` invoking core `describe`
- [ ] T032 [US2] Register `project show` subcommand in `packages/cli/src/cli/RootCommand.ts`
- [ ] T033 [P] [US2] CLI output order test in `packages/cli/test/cli/project-show-command.test.ts`

**Checkpoint**: User Stories 1 and 2 independently testable — init and inspect both backends.

---

## Phase 5: User Story 3 — Storage Backend Parity for Empty Graph Contract (Priority: P3)

**Goal**: JSON and SQLite roots expose identical semantic empty-graph contract (nine `primitiveTypes`, `schemaVersion: 1`, zero primitives).

**Independent Test**: Compare inspect output and on-disk layout docs for JSON vs SQLite roots per `quickstart.md` SC-003.

### Tests for User Story 3

- [ ] T034 [P] [US3] Cross-backend parity test in `packages/core/test/project/storage-parity.test.ts` comparing `ProjectDescriptor` fields across JSON and SQLite roots
- [ ] T035 [P] [US3] Empty-graph contract test in `packages/core/test/project/empty-graph-contract.test.ts` (all nine types report count `0`, `graph.empty === true`)
- [ ] T036 [US3] On-disk layout contract test in `packages/core/test/storage/layout-contract.test.ts` verifying paths match `contracts/storage-layouts.md`

**Checkpoint**: All user stories independently functional with verified backend parity.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, regression, and release validation.

- [ ] T037 [P] Add synthetic init example directories under `packages/cli/examples/project/` if useful for docs and manual demos
- [ ] T038 Run full `quickstart.md` demo flow manually and fix any gaps in contracts or CLI messages
- [ ] T039 [P] Update `AGENTS.md` repository structure section for `packages/core/` and revised CLI boundaries
- [ ] T040 Verify v0 regression: `specable check packages/cli/examples/generic/valid` unchanged in `packages/cli/test/` or manual quickstart step
- [ ] T041 Run `pnpm codegen`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build` from repository root
- [ ] T042 Run `pnpm exec fallow audit --base main --format json --quiet` and resolve findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational; practically needs US1 roots for full CLI demo but core inspect tests can use US1 fixtures
- **User Story 3 (Phase 5)**: Depends on US1 + US2 completion (parity compares both flows)
- **Polish (Phase 6)**: Depends on desired user stories complete

### User Story Dependencies

```text
Phase 1 Setup → Phase 2 Foundational
                    ↓
              Phase 3 US1 (Init) ──────┐
                    ↓                  │
              Phase 4 US2 (Inspect) ←──┘
                    ↓
              Phase 5 US3 (Parity)
                    ↓
              Phase 6 Polish
```

- **US1 (P1)**: No dependency on US2/US3
- **US2 (P2)**: Core inspect tests independent; CLI E2E assumes init works
- **US3 (P3)**: Requires both backends initialized and inspectable

### Within Each User Story

- Tests MUST fail before implementation
- Core service logic before CLI adapters
- Layer composition in `bin.ts` after commands exist
- Story checkpoint before next priority

### Parallel Opportunities

- **Phase 1**: T002, T006 in parallel after T001
- **Phase 2**: T008–T011, T013–T014, T018 in parallel; T015 after T013+T014; T016 after T012
- **Phase 3**: T019–T021 parallel; T023+T026 parallel after T022
- **Phase 4**: T027–T028 parallel; T030+T033 parallel after T029
- **Phase 5**: T034–T035 parallel
- **Phase 6**: T037, T039 parallel

---

## Parallel Example: User Story 1

```bash
# Core init tests together (after Phase 2):
T019: packages/core/test/project/init-json.test.ts
T020: packages/core/test/project/init-sqlite.test.ts
T021: packages/core/test/project/init-failures.test.ts

# After T022 completes:
T023: packages/cli/src/cli/InitCommand.ts
T026: packages/cli/test/cli/init-command.test.ts
```

---

## Parallel Example: Foundational Phase

```bash
# Schema and error modules (no cross-deps):
T008: packages/core/src/storage/PrimitiveTypes.ts
T009: packages/core/src/project/ProjectConfig.ts
T010: packages/core/src/project/ProjectDescriptor.ts
T011: packages/core/src/project/errors.ts

# Storage backends (after T012):
T013: packages/core/src/storage/JsonStorageBackend.ts
T014: packages/core/src/storage/SqliteStorageBackend.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `specable init /tmp/demo-json` and `--storage sqlite` per `quickstart.md`
5. Demo JSON-default init as alpha entry point

### Incremental Delivery

1. Setup + Foundational → core library ready
2. US1 → init JSON (default) + SQLite → **MVP**
3. US2 → `project show` for both backends
4. US3 → parity tests and layout contracts
5. Polish → quickstart, AGENTS.md, CI gates

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Developer A: US1 (init + CLI)
   - Developer B: US2 core inspect (T027–T029) while A finishes CLI init
3. US3 + Polish after US1 and US2 merge

---

## Notes

- Do **not** migrate v0 `GraphRepository` / `graph/` into core (FR-018a)
- Do **not** wire `specable check` to alpha roots this milestone
- `specable.json` write-last ordering is required for interrupted-init detection
- Commit generated `packages/core/src/index.ts` after `pnpm codegen`
- Add changeset for `@specable/core` and any publishable `@specable/cli` changes
