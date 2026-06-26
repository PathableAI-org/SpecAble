# Feature Specification: Initialize JSON and SQLite Project Roots

**Feature Branch**: `002-initialize-project-roots`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Initialize JSON and SQLite project roots — the CLI can initialize and inspect local SpecAble project roots backed by either JSON files or a SQLite file, proving that a SpecAble root is a project context bound to a storage backend — not hard-coded to one persistence format."

## Clarifications

### Session 2026-06-26

- Q: How should JSON and SQLite backends share the same storage abstraction at this milestone? → A: Single shared `StorageBackend` service contract (bootstrap empty store, summarize graph counts); JSON and SQLite each provide a swappable Live implementation composed at the application boundary (same pattern as `@effect/platform` abstractions with `@effect/platform-node` Layers).
- Q: What is the canonical project identity for inspect output and future MCP root selection? → A: Stable UUID `projectId` generated at init (canonical); `name` is display-only; filesystem path is operational CLI context only.
- Q: What marks a directory as an initialized SpecAble project root? → A: `specable.json` manifest required at project root; valid decode defines an initialized root; v0 fixture directories without it are not project roots.
- Q: How is the display `name` chosen when the user initializes a project? → A: Default to target directory basename; optional `--name` flag overrides.
- Q: Which primitive types are written to project configuration at initialization? → A: Fixed canonical nine v0 product primitive types; not user-configurable at this milestone.
- Q: How should the `--storage` flag behave on the init command? → A: Optional; defaults to `json`; `--storage sqlite` selects SQLite.
- Q: Where should init and inspect business logic live so both CLI and a future MCP server can share it? → A: New `@specable/core` library owns project-root and storage-backend Effects; `@specable/cli` is a minimal wrapper composing Layers and rendering output.
- Q: What is the scope of `@specable/core` for this milestone relative to existing v0 code in `@specable/cli`? → A: Core contains init, inspect, and storage backends only; existing v0 `specable check` graph loading remains in `@specable/cli` until a later refactor.
- Q: Where should infrastructure Live Layers (filesystem, JSON/SQLite storage backends) be composed? → A: `@specable/core` exports service contracts and per-backend Live Layer modules; `@specable/cli` (and future MCP) compose the full Layer stack at their entrypoints.
- Q: Where should init/inspect/storage tests live? → A: Contract and behavior tests in `@specable/core`; `@specable/cli` tests cover command wiring, flag defaults, and output formatting only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize a SpecAble Project Root (Priority: P1)

A local developer wants to start working with SpecAble on their machine. They run an initialization command against a target path, choosing whether the project stores its primitive graph as local JSON files or in a local SQLite database. The command creates a new SpecAble project with a stable project identity, a bound storage backend, and an empty product primitive graph namespace ready for later milestones.

**Why this priority**: Without a way to create project roots, no alpha workflow can persist desired product state. Initialization is the entry point for every subsequent feature in the alpha release.

**Independent Test**: Run initialization twice—once with JSON storage and once with SQLite storage—using synthetic local paths. Confirm each run produces a distinct, documented on-disk layout, persists readable project configuration, and leaves the graph in a known empty state without network access or external credentials.

**Acceptance Scenarios**:

1. **Given** an empty local directory path, **When** the user initializes a project without `--storage`, **Then** a JSON-backed SpecAble project root is created with documented JSON file layout, persisted project configuration, and an empty product primitive graph namespace.
2. **Given** an empty local directory path, **When** the user initializes a project with `--storage sqlite`, **Then** a SpecAble project root is created with a documented SQLite database location, persisted project configuration, and an empty product primitive graph namespace.
3. **Given** a path where `specable.json` already exists, **When** the user attempts initialization again, **Then** the command fails with a clear, actionable error and does not overwrite or corrupt existing configuration.
4. **Given** an unsupported or misspelled storage type, **When** the user attempts initialization, **Then** the command fails with a clear error listing supported storage types (`json`, `sqlite`).
5. **Given** initialization in `./demo-json` without `--name`, **When** the user inspects the project, **Then** display `name` is `demo-json` and canonical `projectId` is a distinct UUID.
6. **Given** no network connectivity and no third-party credentials, **When** the user initializes a project, **Then** initialization completes successfully using only local filesystem access.

---

### User Story 2 - Inspect Project Root Configuration (Priority: P2)

After initialization (or when opening an existing project), a developer or future agent client needs to understand what project they are working with: project identity, which storage backend is bound, where data lives, which primitive types or schema version apply, and whether the graph is empty.

**Why this priority**: Inspectability proves that a root is a storage-bound project context—not merely a folder—and gives reviewers and downstream milestones a consistent way to verify setup before adding CRUD or MCP features.

**Independent Test**: Initialize JSON and SQLite roots, then run the inspect command against each. Confirm output includes all required configuration fields and reflects an empty graph state, without exposing raw internal storage paths as the primary identity of the project.

**Acceptance Scenarios**:

1. **Given** a valid JSON-backed project root, **When** the user inspects the project, **Then** output reports canonical `projectId`, display `name`, storage type (`json`), storage location (user-meaningful path), configured primitive types or schema reference, and empty graph state.
2. **Given** a valid SQLite-backed project root, **When** the user inspects the project, **Then** output reports the same semantic fields as JSON-backed roots (including canonical `projectId` and display `name`), differing only in storage type (`sqlite`) and storage location appropriate to that backend.
3. **Given** a path without a valid `specable.json` manifest (including legacy v0 fixture directories), **When** the user inspects the project, **Then** the command fails with a clear error explaining that the path is not a valid or complete project root.
4. **Given** a project root with corrupted or incomplete configuration, **When** the user inspects the project, **Then** the command fails with an actionable error identifying what is missing or invalid.

---

### User Story 3 - Storage Backend Parity for Empty Graph Contract (Priority: P3)

A contributor validating alpha behavior needs confidence that JSON and SQLite backends are interchangeable at the semantic layer: both represent the same empty product primitive graph contract so later commands (validation, CRUD, MCP) can target either root without backend-specific behavior at this milestone.

**Why this priority**: The alpha thesis depends on a storage abstraction. Parity at initialization time establishes the foundation that later milestones build on.

**Independent Test**: Initialize one JSON root and one SQLite root. Inspect both and confirm identical semantic empty-graph contract (same primitive type coverage, zero primitives, same schema or ontology version reference) even though on-disk layouts differ.

**Acceptance Scenarios**:

1. **Given** freshly initialized JSON and SQLite project roots, **When** a reviewer compares inspect output for graph state and primitive type configuration, **Then** both roots report the same empty-graph semantic contract with identical nine-type `primitiveTypes` and `schemaVersion: 1`.
2. **Given** freshly initialized roots of each storage type, **When** a reviewer examines on-disk artifacts, **Then** JSON layout and SQLite database location each match committed documentation for that backend.
3. **Given** synthetic project names used in demos and documentation, **When** initialization and inspection run, **Then** no real customer data, production credentials, or network services are required.

---

### Edge Cases

- **Target path is a non-empty directory without `specable.json`**: Initialization fails with a clear error; the user is not left with a partial or ambiguous project state.
- **Legacy v0 fixture directory (primitive files but no `specable.json`)**: Not treated as a project root; inspect fails; `specable check` on such paths remains a separate v0 workflow.
- **Target path does not exist**: Initialization creates the path (or parent paths as appropriate) and completes successfully, or fails with a clear permissions error.
- **Insufficient filesystem permissions**: Initialization or inspection fails with an actionable error; no silent partial writes.
- **Interrupted initialization**: A subsequent inspect or re-init attempt detects incomplete state and reports it rather than presenting a healthy project.
- **Mixed or manual edits to storage files**: Inspect detects invalid or inconsistent configuration and reports actionable errors rather than undefined behavior.
- **Re-initialization on sibling paths**: Each path maintains independent project identity and storage binding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose initialization through a CLI command and MUST implement init behavior in a reusable library API callable by future surfaces (e.g., MCP).
- **FR-001a**: Initialization MUST default the display `name` to the target directory basename and MUST accept an optional `--name` flag to override it.
- **FR-002**: The initialization command MUST accept an optional `--storage` flag with accepted values `json` or `sqlite`; when omitted, storage MUST default to `json`.
- **FR-003**: Initialized project roots MUST persist authoritative configuration in `specable.json` at the project root so later commands can read project state without re-deriving it from raw storage files alone.
- **FR-004**: Project configuration MUST include a stable UUID `projectId` (canonical identity), display `name` (default: directory basename), storage backend type, storage location, the fixed canonical nine v0 product primitive types, `schemaVersion`, and graph version or empty-state indicator.
- **FR-005**: The JSON storage backend MUST create a documented on-disk file layout for the product primitive graph store at initialization time.
- **FR-006**: The SQLite storage backend MUST create a documented database file at a documented location for the same semantic graph contract at initialization time.
- **FR-007**: Both storage backends MUST expose an identical semantic empty-graph contract immediately after initialization (zero primitives, identical nine-type `primitiveTypes` list, `schemaVersion: 1`).
- **FR-007a**: Initialization MUST write the fixed canonical nine v0 product primitive types to configuration; user customization of the type set is out of scope for this milestone.
- **FR-008**: The system MUST expose inspection through a CLI command (e.g., `project show`) and MUST implement inspect behavior in the same reusable library API as initialization.
- **FR-008a**: The inspect library API MUST return a structured project descriptor with canonical `projectId`, display `name`, storage type, storage location, primitive types or schema reference, and graph empty state.
- **FR-009**: Initialization MUST fail clearly when `specable.json` already exists at the target path, without overwriting existing data.
- **FR-009a**: A directory is an initialized SpecAble project root if and only if `specable.json` exists at that path and decodes as valid project configuration.
- **FR-010**: Initialization MUST fail clearly when `--storage` is invalid or unsupported, listing accepted values (`json`, `sqlite`).
- **FR-011**: Inspect MUST fail clearly when `specable.json` is missing, invalid, or incomplete at the target path.
- **FR-012**: All initialization and inspection behavior MUST operate local-first with no network access or external credentials.
- **FR-013**: Demos, documentation, and bundled examples MUST use synthetic project names and local paths only.
- **FR-014**: Product scope MUST be limited to product primitives; design primitives, engineering primitives, and non-product graph types are out of scope.
- **FR-015**: Initialization MAY perform empty-graph sanity checks but MUST NOT implement full graph validation rules (deferred to later milestones).
- **FR-016**: Storage backend mechanics MUST remain behind a single shared storage backend contract (bootstrap empty store, summarize graph state) with swappable JSON and SQLite implementations; `@specable/core` MUST export service contracts and per-backend Live Layer modules, and application entrypoints (`@specable/cli`, future MCP) MUST compose the full Layer stack.
- **FR-016a**: JSON and SQLite backends MUST implement the same storage backend contract so either can be selected at init time without changing consumer command behavior.
- **FR-017**: Canonical project identity MUST be the persisted UUID `projectId`; display `name` and filesystem path are secondary. Configuration MUST be suitable for future MCP root selection keyed by `projectId`, not raw filesystem paths.
- **FR-018**: Initialization, inspection, project configuration, and storage-backend logic MUST live in `@specable/core`; `@specable/cli` MUST be a thin adapter that invokes core Effects, composes core and platform Layers at its entrypoint, and formats CLI output only.
- **FR-018a**: This milestone MUST NOT migrate existing v0 graph loading, validation, or integrity code from `@specable/cli` into `@specable/core`; `specable check` on legacy fixture directories MUST remain unchanged.
- **FR-019**: Init, inspect, and storage-backend behavior MUST have contract and unit tests in `@specable/core`; `@specable/cli` tests MUST be limited to command wiring (including `--storage` defaulting to `json`), Layer composition, and output formatting.

### Key Entities

- **Project Root**: A filesystem directory containing a valid `specable.json` manifest plus the storage artifacts it references—a storage-bound project context comprising identity, configuration, and a graph namespace, not merely a folder of primitive files.
- **Project Configuration**: Persisted metadata in `specable.json` describing canonical `projectId`, display `name`, storage binding, schema or primitive type reference, and graph state/version.
- **Storage Backend Binding**: The association between a project root and either JSON file storage or SQLite database storage, including user-meaningful storage location.
- **Storage Backend Contract**: A shared interface for bootstrap and graph-summary operations; JSON and SQLite provide interchangeable Live Layer implementations exported from `@specable/core`.
- **Graph Namespace**: The logical container for product primitive instances within a project root; starts empty at initialization.
- **Primitive Type / Schema Reference**: The fixed canonical nine v0 product primitive types plus `schemaVersion: 1` written at init; not user-configurable this milestone.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can initialize a JSON-backed project root and a SQLite-backed project root, inspect both, and complete the documented demo flow in under 5 minutes on a standard developer machine without network access.
- **SC-002**: 100% of required inspect fields (canonical `projectId`, display `name`, storage type, storage location, primitive type or schema reference, empty graph state) are present and accurate for both storage backends immediately after initialization.
- **SC-003**: JSON and SQLite roots initialized from the same synthetic project naming conventions expose identical empty-graph semantic contract (same nine `primitiveTypes`, `schemaVersion: 1`, zero primitives) as reported by the inspect command.
- **SC-004**: All documented initialization failure scenarios (already initialized path, invalid storage type, non-root path on inspect) produce human-readable, actionable error messages without partial or corrupted project state.
- **SC-005**: Committed documentation describes each backend's on-disk layout such that a reviewer can verify file and database locations without reading source code.
- **SC-006**: Subsequent alpha milestones can target either initialized root type as a drop-in project context without backend-specific setup steps; storage defaults to JSON when not specified at init time.
- **SC-007**: Init and inspect commands exercise the same storage backend contract for both JSON and SQLite roots; swapping storage type requires no changes to consumer command logic.
- **SC-008**: Init and inspect behaviors are invocable from `@specable/core` without importing `@specable/cli`; a future MCP server can reuse the same library API without duplicating business logic.
- **SC-009**: Init, inspect, and storage parity scenarios are covered by `@specable/core` tests independent of CLI execution; CLI test suite verifies defaults and surface behavior only.

## Assumptions

- Users have local filesystem read/write access to their chosen project path.
- The canonical Product Primitives ontology and type definitions established in v0 apply to project configuration and empty-graph contract.
- A single project root per command invocation is sufficient for alpha demos; multi-root server management in one process is out of scope.
- New projects start with an empty graph namespace; optional seed data is not required for this milestone.
- Project configuration format will remain stable enough for later MCP root selection; breaking changes require explicit migration planning in a future milestone.
- JSON and SQLite are the only storage backends required for this milestone; hosted or third-party adapters (Notion, Confluence, etc.) are explicitly out of scope.
- Inspect output is intended for human developers and future agent clients; rich formatting is acceptable as long as required fields are unambiguous.
- Legacy v0 fixture directories (primitive JSON files without `specable.json`) are not project roots for init/inspect; they remain valid targets for v0 `specable check` only.

## Dependencies

- Builds on v0 domain schemas (`@specable/domain`), primitive type definitions, and local-first library patterns where applicable.
- Introduces `@specable/core` for project-root initialization, inspection, and storage backends; `@specable/cli` depends on core and provides the CLI surface only.
- No upstream milestone dependencies; this is the first alpha vertical slice.
- Primitive CRUD, relationship management, full validation, and MCP integration are explicitly deferred to later milestones.

## Out of Scope

- Primitive create, read, update, or delete operations.
- Relationship management between primitives.
- Graph validation beyond init-time empty-graph sanity checks.
- MCP server protocol integration or resource exposure.
- Notion, Confluence, or other hosted storage adapters.
- Multi-root management within a single server process.
- Design primitives, engineering primitives, and roadmap or slice-planning graph types.
- User customization of the primitive type set at initialization.
- Migrating v0 `specable check`, graph loading, validation, or integrity modules into `@specable/core`.
- Wiring `specable check` to alpha project roots (deferred until CRUD lands).
