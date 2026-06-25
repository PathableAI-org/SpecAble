# Feature Specification: Primitive CRUD for Local Graph Projects

**Feature Branch**: `002-primitive-crud`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Before we start generating human facing summaries of the graph, we need basic CRUD operations on the primitives"

## Clarifications

### Session 2026-06-24

- Q: Should CRUD validate full graph rules on every write? → A: **Schema decode only** on write (structural/type correctness per `@specable/domain`). Full status-aware validation remains the responsibility of `specable check`; CRUD MAY offer an optional `--check` flag to run validation after a write but MUST NOT block Draft authoring by default.
- Q: What is the write scope for v1 of this slice? → A: **Local JSON graph projects only** — same fixture layout as `001-product-primitives-v0`. No Notion/sync write-back.
- Q: How should users supply primitive payloads? → A: **JSON via `--file` or stdin** for create/update; stdout JSON for get/list; deterministic pretty-printed JSON on disk.
- Q: Is `specable init` in scope? → A: **Yes** — scaffold an empty graph project directory with optional `graph.json` and empty per-type JSON files (or create type files lazily on first create).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scaffold a New Graph Project (Priority: P1)

A product engineer starts modeling a new product from scratch. They run a command to create an empty local graph project with the correct JSON file layout so they can add primitives without hand-authoring boilerplate.

**Why this priority**: Without a project skeleton, create operations would fail or require manual file creation — blocking the authoring workflow that summaries depend on.

**Independent Test**: Run `specable init` on an empty directory; confirm `graph.json` (when requested) and documented per-type files exist; re-running init on a non-empty project fails with a clear error.

**Acceptance Scenarios**:

1. **Given** an empty directory, **When** the user runs `specable init <dir>`, **Then** the directory contains a valid graph project layout per the fixture contract (at minimum `graph.json` when `--with-metadata` is used, or an empty project ready for lazy file creation).
2. **Given** a directory that already contains primitive files, **When** the user runs `specable init <dir>` without `--force`, **Then** the command fails with exit code `2` and does not overwrite existing files.
3. **Given** no network connectivity, **When** the user initializes a project, **Then** the command completes using only local filesystem operations.

---

### User Story 2 - Create and Read Primitives (Priority: P1)

A product owner adds new primitives to their graph project incrementally — an Actor, then a Capability — and retrieves them by ID to confirm persistence.

**Why this priority**: Create + read are the minimum viable authoring loop. Summary generation is meaningless on graphs users cannot populate.

**Independent Test**: Create two primitives of different types via CLI; `get` by ID returns the stored JSON; `list` by type returns both entries; files on disk match the fixture contract.

**Acceptance Scenarios**:

1. **Given** a valid graph project, **When** the user creates a primitive with valid JSON (stdin or `--file`), **Then** the primitive is appended to the correct per-type JSON file, schema-decoded, and reported on stdout with its `id` and `type`.
2. **Given** a primitive ID that already exists in the project, **When** the user attempts create with the same `id`, **Then** the command fails with a tagged duplicate-ID error and exit code `2` without modifying the file.
3. **Given** a stored primitive, **When** the user runs get by ID, **Then** stdout emits the primitive as JSON matching the on-disk record.
4. **Given** a type filter, **When** the user lists primitives, **Then** stdout emits a JSON array of primitives for that type only, in stable sorted order by `id`.
5. **Given** malformed JSON or schema decode failure, **When** the user attempts create, **Then** the command fails with exit code `2`, reports file path and field path, and does not partially write corrupt state.

---

### User Story 3 - Update and Delete Primitives (Priority: P2)

After initial authoring, the user refines primitive fields (status promotion Draft → Active, added relationships) or removes obsolete primitives.

**Why this priority**: Update and delete complete CRUD but depend on create/read infrastructure from P1.

**Independent Test**: Update a primitive's `status` and `description`; delete another; confirm file contents, get returns not-found for deleted ID, and update rejects ID mismatches.

**Acceptance Scenarios**:

1. **Given** an existing primitive, **When** the user updates with JSON whose `id` matches the target, **Then** the on-disk record is replaced in the correct type file with schema-valid content.
2. **Given** update JSON whose `id` differs from the CLI target ID, **When** the user runs update, **Then** the command fails with exit code `2` and does not modify files.
3. **Given** an existing primitive, **When** the user deletes by ID, **Then** the primitive is removed from its type file; if the file's `primitives` array becomes empty, the file MAY remain as `{ "primitives": [] }` or be deleted per documented policy.
4. **Given** a non-existent ID, **When** the user runs update or delete, **Then** the command fails with a tagged not-found error and exit code `2`.
5. **Given** the same graph loaded before and after an update, **When** `GraphRepository.load` runs, **Then** the in-memory graph reflects the mutation.

---

### User Story 4 - Author Graphs for Downstream Check and Summary (Priority: P3)

A user authors a small graph entirely through CRUD commands, then runs `specable check` from `001-product-primitives-v0` to validate and preview a summary — proving the authoring slice unblocks the read/analyze pipeline.

**Why this priority**: Confirms the vertical slice outcome: CRUD enables the summary workflow the user called out as the next milestone.

**Independent Test**: Script create commands for a minimal valid graph; run `specable check`; confirm validation passes or reports expected Draft warnings without decode errors.

**Acceptance Scenarios**:

1. **Given** a graph authored only via CRUD, **When** the user runs `specable check <dir> --validate-only`, **Then** validation runs without fixture decode failures.
2. **Given** CRUD writes and subsequent check, **When** the user inspects on-disk JSON, **Then** files remain valid per `001` fixture contract (one file per type, `primitives` array, typed entries).

---

### Edge Cases

- **Missing type file on create**: Create MUST materialize the per-type JSON file if absent (`{ "primitives": [newEntry] }`).
- **Cross-type ID collision**: IDs MUST be unique across all types; create/update MUST reject duplicates globally (consistent with `001` duplicate-ID validation).
- **Concurrent edits**: v0 does not support multi-writer locking; last writer wins; document as out of scope for file locking.
- **Delete last primitive in file**: Keep empty `{ "primitives": [] }` file for predictable layout (preferred over deleting the file).
- **Update changes primitive type**: Not supported — type is inferred from storage location; attempting to change `type` field to a different value MUST fail.
- **Reference fields on create**: Allowed even when referenced IDs do not exist yet (authoring order flexibility); full reference validation remains in `specable check`.
- **Atomicity**: Partial writes on failure MUST NOT leave corrupt JSON; use write-to-temp-then-rename.
- **Deterministic disk format**: Pretty-printed JSON with stable key ordering and trailing newline for diff-friendly projects.

## Requirements *(mandatory)*

### Functional Requirements

**Scope**

- **FR-101**: This feature MUST add create, read (get/list), update, and delete operations for primitives in local JSON graph projects using the fixture layout defined in `001-product-primitives-v0`.
- **FR-102**: CRUD logic MUST live in `@specable/cli` library modules behind a repository-shaped service; CLI commands MUST be thin adapters.
- **FR-103**: All primitive payloads MUST be decoded/encoded with `@specable/domain` schemas at the write boundary.
- **FR-104**: External service write-back (Notion, GitHub, etc.) MUST remain out of scope.

**Project initialization**

- **FR-105**: Users MUST be able to initialize a new graph project directory via `specable init <dir>`.
- **FR-106**: Init MUST NOT destroy existing primitive data without an explicit `--force` flag.

**Create**

- **FR-107**: Users MUST be able to create a primitive via `specable primitive create <projectDir>` with JSON from `--file` or stdin.
- **FR-108**: Create MUST append to the correct per-type file based on the primitive's `type` field.
- **FR-109**: Create MUST reject duplicate IDs across the entire graph project.

**Read**

- **FR-110**: Users MUST be able to fetch one primitive by ID via `specable primitive get <projectDir> <id>`.
- **FR-111**: Users MUST be able to list primitives via `specable primitive list <projectDir>` with optional `--type <PrimitiveType>` filter.

**Update**

- **FR-112**: Users MUST be able to replace a primitive via `specable primitive update <projectDir> <id>` with JSON from `--file` or stdin.
- **FR-113**: Update MUST require the payload `id` to match the CLI `<id>` argument.

**Delete**

- **FR-114**: Users MUST be able to delete a primitive by ID via `specable primitive delete <projectDir> <id>`.

**Persistence**

- **FR-115**: Writes MUST be atomic (temp file + rename).
- **FR-116**: On-disk JSON MUST use stable formatting (deterministic key order, 2-space indent, trailing newline).
- **FR-117**: Missing per-type files on read/list MUST behave as empty collections (consistent with `001` loader).

**CLI ergonomics**

- **FR-118**: Successful CRUD commands MUST emit machine-readable JSON on stdout (created/updated/deleted record or list/get result) unless `--quiet` is passed (then emit minimal confirmation).
- **FR-119**: CRUD commands MUST use exit code `0` on success, `2` on usage/decode/not-found/duplicate errors.
- **FR-120**: An optional `--check` flag on mutating commands MAY run `specable check --validate-only` after the write and surface validation status without changing the write exit code policy.

**Integration with 001**

- **FR-121**: After any CRUD mutation, `GraphRepository.load(projectPath)` MUST return a graph reflecting the change without requiring a separate cache invalidation step.
- **FR-122**: CRUD MUST NOT modify the behavior of existing `specable check` commands.

### Key Entities

- **GraphProject**: Directory of JSON fixture files; same as `001`.
- **PrimitiveRecord**: A decoded domain primitive (one of nine types) stored in a type file's `primitives` array.
- **PrimitiveStore** (service): Repository-shaped CRUD contract over a graph project path.
- **WriteResult**: Structured success payload (`action`, `id`, `type`, `filePath`).
- **PrimitiveNotFoundError**: Tagged error when ID does not exist.
- **DuplicatePrimitiveIdError**: Tagged error on create/update ID collision (may reuse `DuplicateIdError` from `001` if applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-101**: A user can scaffold a new graph project and add at least three primitives of different types using only CLI commands, with zero manual file editing.
- **SC-102**: Create + get round-trip preserves byte-identical primitive JSON (modulo deterministic formatting) for all nine primitive types.
- **SC-103**: Update and delete operations reflect in `GraphRepository.load` results within the same process invocation.
- **SC-104**: Injected duplicate-ID and schema-decode failures are reported with correct exit code `2` in 100% of tested scenarios.
- **SC-105**: A graph authored entirely via CRUD commands loads successfully in existing `001` graph loader tests/contracts without decode errors.
- **SC-106**: CRUD command suite completes on a typical developer laptop in under 2 seconds for a 50-primitive graph.

## Assumptions

- `001-product-primitives-v0` Phase 2 graph loading (`GraphRepository`, `FixtureFiles`, domain schemas) is available on the implementation branch.
- Users author graphs locally; multi-user concurrent editing is out of scope.
- Full status-aware validation after every write is optional (`--check`), not default — Draft authoring must remain frictionless.
- Primitive `type` in JSON must match the storage file; type changes require delete + create.
- Global ID uniqueness matches `001` validation rules.

## Out of Scope

- YAML fixtures, Notion/sync adapters, MCP write tools
- Bulk import/export, patch/merge updates (JSON replace only)
- Interactive TUI or web editor
- Graph-level transactions across multiple primitives
- Automatic story text generation on create (remains in `001` validation/summary)
- File watching or hot reload

## Dependencies

- **Depends on**: `001-product-primitives-v0` — domain schemas, `ProductGraph`, `GraphRepository.load`, fixture format contract, `DuplicateIdError`
- **Enables**: Continued `001` work on validation, integrity, and summary against user-authored graphs
