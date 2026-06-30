---
description: "Task list for Readable Semantic Wiki feature implementation"
---

# Tasks: Readable Semantic Wiki

**Input**: Design documents from `/specs/004-readable-semantic-wiki/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Per SpecAble constitution, tests for schema decode, adapter behavior, error handling, and round-trip parity are REQUIRED.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **SpecAble default (library-first monorepo)**: `packages/<name>/src/`, `packages/<name>/test/`
- All wiki backend code lives in `packages/core/src/storage/`
- CLI wiring updates in `packages/cli/src/cli/` and `packages/cli/src/services/`
- Tests in `packages/core/test/storage/` and `packages/cli/test/`

## Implementation conventions

Per constitution v1.3.0, plan.md, and
[effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md):

- Never use `any`; avoid type casts unless documented at an external boundary.
- Hide storage/adapter mechanics behind repository services; feature modules depend on stable load/query contracts, not loader internals.
- Declare service dependencies in `Effect<A, E, R>`; access via `yield* Tag` — never pass service instances as function parameters.
- Resolve platform tags during Layer construction; public consumer methods SHOULD have `R = never` when deps are absorbed at Layer build.
- Compose Live Layers at entrypoints (`bin.ts`, `services/Layers.ts`) and in test harnesses — not in CLI command modules.
- Tests use `@effect/vitest` `it.effect` with `Effect.provide(TestLayer)` or live platform Layers.
- No `._tag` on foreign ADTs: use `Either.isLeft`, `Option.isSome`, `Schema.decodeUnknown` in `Effect.gen`, or `match` APIs.

**Task patterns for I/O features**:

- Foundational: create wiki-file-layout.ts shared module with wiki file API
- Backend implementations: MarkdownStorageBackend.ts and OrgStorageBackend.ts with same 5-method StorageBackendService contract
- Integration: wire Layers at composition root (`packages/cli/src/services/Layers.ts`, `packages/cli/src/bin.ts`)
- Tests: `it.effect` + `Effect.provide` with test/live Layers (no floating Requirements)
- Org property drawer parsing: lightweight regex/line-based parser (no external dependency)
- Markdown frontmatter: use `js-yaml` (new dependency in packages/core)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing schemas and add the YAML dependency needed by both wiki backends

- [ ] T001 Add `js-yaml` and `@types/js-yaml` dependencies to `packages/core/package.json` (scoped to Markdown backend only — will be imported only in MarkdownStorageBackend.ts)
- [ ] T002 [P] Extend `StorageType` schema literal in `packages/core/src/project/ProjectConfig.ts` to include `"md"` and `"org"` alongside existing `"json"` and `"sqlite"`
- [ ] T003 [P] Extend `storageBindingFor` helper in `packages/core/src/project/ProjectRootService.ts` to handle `"md"` and `"org"` storage types (both map to `location: "."`)
- [ ] T004 Extend `parseStorageType` in `packages/cli/src/cli/InitCommand.ts` to accept `"md"` and `"org"` values (currently only accepts `"json"` / `"sqlite"`)

**Checkpoint**: Setup complete — StorageType extended, `js-yaml` available, CLI accepts `--storage md` and `--storage org` values (will fail at Layer composition until backends exist).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared wiki file-layout module that both Markdown and Org backends depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. The wiki file layout provides type→directory mapping, ID→filename conversion, directory scanning, and filesystem-safe ID validation that both backends use.

- [ ] T005 Create `packages/core/src/storage/wiki-file-layout.ts` with `PRIMITIVE_TYPE_DIRECTORIES` mapping (all 9 canonical types → pluralized kebab-case directory names matching existing `PRIMITIVE_TYPE_FILES` convention)
- [ ] T006 [P] Export `WIKI_TYPE_DIRECTORY_ENTRIES` for all 9 canonical types and `ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES` (excluding `CapabilityConceptLink`)
- [ ] T007 [P] Export `directoryForType(type)` — returns directory name for a primitive type
- [ ] T008 [P] Export `idToFilename(id, extension)` and `filenameToId(filename)` — converts between IDs and filenames
- [ ] T009 [P] Export `filePathFor(projectRoot, type, id, extension)` — returns full file path
- [ ] T010 [P] Export `scanTypeDirectory(fs, projectRoot, directory, extension)` — scans directory for matching files, returns filenames
- [ ] T011 [P] Export `sanitizeIdForFile(id)` — validates/cleans ID for filesystem safety (pass-through with validation warning)
- [ ] T012 Export `WikiFileLayoutError` tagged error type for filesystem-unsafe ID or missing directory errors

**Checkpoint**: Foundation ready — wiki file-layout module provides all shared helpers for directory resolution, filename conversion, directory scanning, and ID sanitization. Both backend implementations can now import from this single source of truth.

---

## Phase 3: User Story 1 - Initialize a human-readable wiki project (Priority: P1) 🎯 MVP

**Goal**: `specable init --storage md` and `specable init --storage org` create project roots with per-type directories and correct `specable.json`.

**Independent Test**: Run `specable init /tmp/demo --storage md` and verify type directories exist with empty `specable.json` recording `"type": "md"`. Repeat with `--storage org`.

### Implementation for User Story 1

- [ ] T013 Implement `MarkdownStorageBackend.bootstrap` in `packages/core/src/storage/MarkdownStorageBackend.ts` — validates `config.storage.type === "md"`, creates all 9 per-type directories via `wiki-file-layout.ts` directory list, returns void
- [ ] T014 Implement `OrgStorageBackend.bootstrap` in `packages/core/src/storage/OrgStorageBackend.ts` — validates `config.storage.type === "org"`, creates all 9 per-type directories, returns void
- [ ] T015 [P] Export `MarkdownStorageBackendLive` and `OrgStorageBackendLive` from `packages/core/src/storage/layers.ts` (alongside existing JSON/SQLite exports)
- [ ] T016 Extend `RoutedStorageBackend` in `packages/core/src/storage/RoutedStorageBackend.ts` to route to all four backends (JSON, SQLite, Markdown, Org) based on `config.storage.type`
- [ ] T017 Extend `projectRootLiveLayer` in `packages/cli/src/services/Layers.ts` to provide `MarkdownStorageBackendLive` or `OrgStorageBackendLive` based on the selected storage type
- [ ] T018 Ensure `projectRootInspectLiveLayer` uses extended `RoutedStorageBackendLive` to handle project show for md/org-backed roots

### Tests for User Story 1

- [ ] T019 [P] [US1] Test that `MarkdownStorageBackend.bootstrap` creates all 9 per-type directories in `packages/core/test/storage/storage-backends.test.ts`
- [ ] T020 [P] [US1] Test that `OrgStorageBackend.bootstrap` creates all 9 per-type directories in the same test
- [ ] T021 [P] [US1] Test bootstrap rejects mismatched storage type (e.g., Markdown backend called with `"org"` config) — produces `IncompleteProjectError`
- [ ] T022 [US1] Test `RoutedStorageBackend` routes correctly to Markdown and Org backends in `packages/core/test/storage/storage-crud.test.ts`
- [ ] T023 [US1] Add `mdStorageTestLayer` and `orgStorageTestLayer` to `packages/core/test/fixtures/project/layers.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional — `specable init --storage md` and `specable init --storage org` create correct project layouts.

---

## Phase 4: User Story 2 + User Story 3 - Create, list, and get primitives on wiki backends (Priority: P1)

**Goal**: `specable primitive create|list|get` works identically on Markdown- and Org-backed roots. Primitives are written as readable `.md` or `.org` files with typed metadata, and read back via the same CLI commands.

**Independent Test**: `specable init /tmp/demo --storage md`, create a Capability, verify file exists with readable frontmatter and body. `specable primitive list` shows it. `specable primitive get --id <id>` returns full data. Repeat with `--storage org` and verify semantic parity.

### Implementation for User Story 2+3

- [ ] T024 [P] [US2] Implement Markdown frontmatter encoder in `packages/core/src/storage/MarkdownStorageBackend.ts` — serializes primitive metadata to YAML via `js-yaml.dump`, wraps between `---` delimiters, appends body prose after closing `---`
- [ ] T025 [P] [US2] Implement Org property drawer encoder in `packages/core/src/storage/OrgStorageBackend.ts` — serializes metadata as `:KEY: VALUE` lines between `:PROPERTIES:` and `:END:`, appends body prose after
- [ ] T026 [US2] Implement `MarkdownStorageBackend.create` — determines file path via `wiki-file-layout.ts`, checks for duplicate IDs across all type directories, writes file atomically (temp-file + rename pattern matching `JsonStorageBackend`)
- [ ] T027 [US2] Implement `OrgStorageBackend.create` — same logic as Markdown create, but uses property drawer encoding instead of YAML frontmatter
- [ ] T028 [P] [US3] Implement Markdown frontmatter decoder in `packages/core/src/storage/MarkdownStorageBackend.ts` — extracts YAML between `---` delimiters, calls `js-yaml.load`, passes result to `decodePrimitiveUnknown` from existing `PrimitiveSchemas.ts`, preserves body as opaque text
- [ ] T029 [P] [US3] Implement Org property drawer decoder in `packages/core/src/storage/OrgStorageBackend.ts` — extracts key-value pairs between `:PROPERTIES:` and `:END:`, builds object, passes to `decodePrimitiveUnknown`, preserves body
- [ ] T030 [US3] Implement `MarkdownStorageBackend.get` — scans all 9 type directories for file matching `{id}.md`, reads file, decodes frontmatter, returns full primitive with body
- [ ] T031 [US3] Implement `OrgStorageBackend.get` — same as Markdown get but scans for `{id}.org` and decodes property drawer
- [ ] T032 [US3] Implement `MarkdownStorageBackend.list` — scans alpha type directories for `.md` files, reads and decodes frontmatter for each, projects to `PrimitiveSummary` (id, name, status, type)
- [ ] T033 [US3] Implement `OrgStorageBackend.list` — same as Markdown list but scans for `.org` files
- [ ] T034 [P] [US3] Implement `MarkdownStorageBackend.describe` — scans all 9 type directories, counts primitives per type, returns `GraphStoreSummary`
- [ ] T035 [P] [US3] Implement `OrgStorageBackend.describe` — same as Markdown describe but for `.org` files

### Tests for User Story 2+3

- [ ] T036 [P] [US2] Test primitive create on Markdown backend writes valid `.md` file with YAML frontmatter in `packages/core/test/storage/storage-crud.test.ts`
- [ ] T037 [P] [US2] Test primitive create on Org backend writes valid `.org` file with property drawer in the same test
- [ ] T038 [US2] Test duplicate ID rejection on create for both Markdown and Org backends (produces `DuplicatePrimitiveIdError`) in `packages/core/test/storage/storage-crud.test.ts`
- [ ] T039 [P] [US3] Test primitive get on Markdown backend returns decoded primitive with body in `packages/core/test/storage/storage-crud.test.ts`
- [ ] T040 [P] [US3] Test primitive get on Org backend returns decoded primitive with body in the same test
- [ ] T041 [US3] Test primitive get with non-existent ID returns `PrimitiveNotFoundError` for both backends
- [ ] T042 [P] [US3] Test primitive list on Markdown backend returns correct summaries in `storage-crud.test.ts`
- [ ] T043 [P] [US3] Test primitive list on Org backend returns correct summaries in the same test
- [ ] T044 [US3] Test list with type filter for both Markdown and Org backends
- [ ] T045 [US3] Test describe returns correct type counts for both Markdown and Org backends in `packages/core/test/storage/storage-backends.test.ts`
- [ ] T046 [US3] Test multi-line body prose is preserved verbatim on round-trip for both backends
- [ ] T047 [US3] Test YAML frontmatter with special characters (colons, quotes, hashes) is properly encoded/decoded in Markdown backend
- [ ] T048 [US3] Test Org property drawer with colons in values is correctly parsed in Org backend

**Checkpoint**: At this point, User Stories 2 and 3 should be fully functional — primitives can be created, listed, and retrieved on both wiki backends via CLI.

---

## Phase 5: User Story 4 - Edit wiki files manually and re-read with SpecAble (Priority: P2)

**Goal**: A product owner can open a wiki file in a text editor, edit the body prose, save, and see the updated content via `specable primitive get`. Malformed metadata produces clear error messages.

**Independent Test**: Create a primitive via CLI, open the `.md` file in a text editor, change the body prose, save. Run `specable primitive get --id <id>` — the body is updated while ID, type, status remain unchanged. Repeat with `.org` file.

### Implementation for User Story 4

- [ ] T049 [US4] Ensure body-preservation on round-trip in both backends — `get` returns the body as stored verbatim (body is never validated or transformed by the backend)
- [ ] T050 [P] [US4] Implement decode error handling for missing frontmatter in `MarkdownStorageBackend.ts` — file without `---` delimiters produces `PrimitiveValidationError` identifying the affected file
- [ ] T051 [P] [US4] Implement decode error handling for missing property drawer in `OrgStorageBackend.ts` — file without `:PROPERTIES:` block produces `PrimitiveValidationError`
- [ ] T052 [P] [US4] Implement decode error for malformed YAML in Markdown backend — `js-yaml.load` failure mapped to `PrimitiveValidationError` with file path and specific YAML error
- [ ] T053 [P] [US4] Implement decode error for malformed property drawer in Org backend — unparseable drawer content produces `PrimitiveValidationError` with file path and field-level detail
- [ ] T054 [US4] Ensure file extension filtering — Markdown backend only scans `.md` files, Org backend only scans `.org` files (files with wrong extension in wrong backend are silently ignored)

### Tests for User Story 4

- [ ] T055 [P] [US4] Test manual edit round-trip — create primitive, modify body prose in the `.md` file on disk, `get` returns updated body with unchanged metadata
- [ ] T056 [P] [US4] Test manual edit round-trip on Org backend — same scenario with `.org` file
- [ ] T057 [US4] Test missing frontmatter in `.md` file produces `PrimitiveValidationError` with file path
- [ ] T058 [US4] Test missing property drawer in `.org` file produces `PrimitiveValidationError` with file path
- [ ] T059 [US4] Test malformed YAML in frontmatter produces `PrimitiveValidationError` with specific YAML error message
- [ ] T060 [US4] Test malformed Org property drawer (missing `:END:`) produces `PrimitiveValidationError`

**Checkpoint**: At this point, wiki files are truly human-editable and resilient to manual edits. Decode errors are actionable.

---

## Phase 6: User Story 5 - Prove backend parity across all four storage types (Priority: P2)

**Goal**: All four backends (JSON, SQLite, Markdown, Org) pass the same storage round-trip test suite with no backend-specific test branches.

**Independent Test**: Run `pnpm --filter @specable/core test` and confirm all storage tests pass. The same test assertions (create, list, get, describe) run against all four backends with identical expected values.

### Implementation for User Story 5

- [ ] T061 [US5] Parameterize existing backend round-trip tests in `packages/core/test/storage/storage-crud.test.ts` to run against JSON, SQLite, Markdown, and Org backends using the same assertion logic (no backend-specific test branches)
- [ ] T062 [US5] Extend `packages/core/test/storage/layout-contract.test.ts` to verify on-disk layout for Markdown (per-type directories, `.md` files for primitives) and Org (same layout, `.org` files) backends
- [ ] T063 [US5] Add `projectRootMdTestLayer` and `projectRootOrgTestLayer` to `packages/core/test/fixtures/project/layers.ts` for full `ProjectRootService` test coverage
- [ ] T064 [US5] Add `primitiveServiceMdTestLayer` and `primitiveServiceOrgTestLayer` to the same test fixtures file for `PrimitiveService` test coverage

### Tests for User Story 5

- [ ] T065 [US5] Extend existing `storage-backends.test.ts` to test bootstrap and describe for all four backends with identical assertions
- [ ] T066 [US5] Extend existing `storage-crud.test.ts` to run all CRUD assertions (create, list, get, describe, duplicate rejection, not-found) against all four backends — same test code, different Layer provision
- [ ] T067 [US5] Extend existing `layout-contract.test.ts` to verify on-disk layout after init for all four backends — correct files exist, wrong files do not exist
- [ ] T068 [US5] Test empty wiki project — `list` returns empty array with no errors for both Markdown and Org backends

**Checkpoint**: All four backends pass the same test suite. JSON and SQLite tests continue to pass unchanged.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Codegen, documentation, and final validation

- [ ] T069 Run `pnpm codegen` to regenerate `packages/core/src/index.ts` and `packages/cli/src/index.ts` with new exports
- [ ] T070 Run `pnpm check` and fix any type errors
- [ ] T071 Run `pnpm lint` and fix any lint issues
- [ ] T072 Run `pnpm test` — all storage tests pass for all four backends, existing tests unchanged
- [ ] T073 Run `pnpm build` — packages compile successfully
- [ ] T074 Run quickstart validation scenarios from `specs/004-readable-semantic-wiki/quickstart.md`
- [ ] T075 Update `AGENTS.md` or relevant documentation if commands, structure, or conventions changed

**Checkpoint**: Feature complete and validated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 — Init (Phase 3)**: Depends on Foundational completion — provides bootstrap for both backends
- **US2 + US3 — CRUD (Phase 4)**: Depends on Phase 3 (needs bootstrap) — implements create, list, get, describe for both backends
- **US4 — Manual edit (Phase 5)**: Depends on Phase 4 (needs create + get) — adds manual-edit resilience and error handling
- **US5 — Parity tests (Phase 6)**: Depends on Phase 4 (needs working backends) — parameterizes existing test suite for all four backends
- **Polish (Phase 7)**: Depends on all prior phases complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependency on other stories
- **User Story 2 + 3 (P1)**: Combine write + read path — both depend on US1 (bootstrap must exist first)
- **User Story 4 (P2)**: Depends on US2 + US3 (needs working create/get to test manual edits)
- **User Story 5 (P2)**: Depends on US2 + US3 (needs working backends to test parity)

### Within Each Phase

- [P] tasks within a phase can run in parallel (different files, no dependencies)
- Implement backend logic before tests
- Core implementation before integration/wiring

### Parallel Opportunities

- T002 (StorageType extension) and T003 (storageBindingFor) can run in parallel
- T005–T012 (wiki-file-layout.ts) are all in the same file but are sequential exports — can be written as one task
- T013 (Markdown bootstrap) and T014 (Org bootstrap) can run in parallel
- T015 (layer exports) and T016 (RoutedStorageBackend) can run in parallel
- T024 (Markdown encoder) and T025 (Org encoder) can run in parallel
- T028 (Markdown decoder) and T029 (Org decoder) can run in parallel
- T034 (Markdown describe) and T035 (Org describe) can run in parallel
- Most test tasks within a phase can run in parallel (different test assertions, same file)

---

## Parallel Example: Phase 4 (User Story 2+3)

```bash
# Launch Markdown and Org encoding in parallel:
Task: "T024 Implement Markdown frontmatter encoder in MarkdownStorageBackend.ts"
Task: "T025 Implement Org property drawer encoder in OrgStorageBackend.ts"

# Launch Markdown and Org decoding in parallel:
Task: "T028 Implement Markdown frontmatter decoder in MarkdownStorageBackend.ts"
Task: "T029 Implement Org property drawer decoder in OrgStorageBackend.ts"

# Launch Markdown and Org create in parallel:
Task: "T026 Implement MarkdownStorageBackend.create"
Task: "T027 Implement OrgStorageBackend.create"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependency, StorageType, CLI option)
2. Complete Phase 2: Foundational (wiki-file-layout.ts)
3. Complete Phase 3: US1 (bootstrap for md/org, CLI wiring, RoutedStorageBackend)
4. **STOP and VALIDATE**: `specable init --storage md` and `--storage org` create valid project roots
5. Demo: project layout exists, `specable project show` reports storage type

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. + Phase 3 (US1: init) → **MVP**: `specable init --storage md|org` works
3. + Phase 4 (US2+3: CRUD) → **Core**: primitives can be created, listed, retrieved on wiki backends
4. + Phase 5 (US4: manual edit) → **Resilience**: human edits survive round-trip
5. + Phase 6 (US5: parity) → **Quality**: all four backends pass same tests
6. + Phase 7 (Polish) → **Ship**: codegen, lint, build, documentation

### Parallel Team Strategy

With multiple developers:

1. Complete Phase 1 + 2 together
2. Once Foundational is done:
   - Developer A: Markdown backend (T013, T024, T026, T028, T030, T032, T034)
   - Developer B: Org backend (T014, T025, T027, T029, T031, T033, T035)
3. Merge Markdown and Org backends independently
4. Developer C: CLI wiring + RoutedStorageBackend (T016, T017, T018)
5. One developer handles US4 (manual edit) and US5 (parity tests)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All tasks include exact file paths
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
- Tests use `@effect/vitest` `it.effect` with `Effect.provide(TestLayer)` — never floating Requirements
- Use `satisfies StorageBackendService` on returned objects (pattern from existing backends)
- All wiki backend methods absorb `FileSystem.FileSystem` at Layer build — public `R = never`
- JSON and SQLite backends MUST NOT be modified — any change breaks existing tests