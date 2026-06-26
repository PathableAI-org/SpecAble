# Feature Specification: Initialize JSON and SQLite Project Roots

**Feature Branch**: `002-initialize-project-roots`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "Initialize JSON and SQLite project roots — the CLI can initialize and inspect local SpecAble project roots backed by either JSON files or a SQLite file, proving that a SpecAble root is a project context bound to a storage backend — not hard-coded to one persistence format."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize a SpecAble Project Root (Priority: P1)

A local developer wants to start working with SpecAble on their machine. They run an initialization command against a target path, choosing whether the project stores its primitive graph as local JSON files or in a local SQLite database. The command creates a new SpecAble project with a stable project identity, a bound storage backend, and an empty product primitive graph namespace ready for later milestones.

**Why this priority**: Without a way to create project roots, no alpha workflow can persist desired product state. Initialization is the entry point for every subsequent feature in the alpha release.

**Independent Test**: Run initialization twice—once with JSON storage and once with SQLite storage—using synthetic local paths. Confirm each run produces a distinct, documented on-disk layout, persists readable project configuration, and leaves the graph in a known empty state without network access or external credentials.

**Acceptance Scenarios**:

1. **Given** an empty local directory path, **When** the user initializes a project with JSON storage, **Then** a SpecAble project root is created with documented JSON file layout, persisted project configuration, and an empty product primitive graph namespace.
2. **Given** an empty local directory path, **When** the user initializes a project with SQLite storage, **Then** a SpecAble project root is created with a documented SQLite database location, persisted project configuration, and an empty product primitive graph namespace.
3. **Given** a path that is already an initialized SpecAble project root, **When** the user attempts initialization again, **Then** the command fails with a clear, actionable error and does not overwrite or corrupt existing configuration.
4. **Given** an unsupported or misspelled storage type, **When** the user attempts initialization, **Then** the command fails with a clear error listing supported storage types (`json`, `sqlite`).
5. **Given** no network connectivity and no third-party credentials, **When** the user initializes a project, **Then** initialization completes successfully using only local filesystem access.

---

### User Story 2 - Inspect Project Root Configuration (Priority: P2)

After initialization (or when opening an existing project), a developer or future agent client needs to understand what project they are working with: project identity, which storage backend is bound, where data lives, which primitive types or schema version apply, and whether the graph is empty.

**Why this priority**: Inspectability proves that a root is a storage-bound project context—not merely a folder—and gives reviewers and downstream milestones a consistent way to verify setup before adding CRUD or MCP features.

**Independent Test**: Initialize JSON and SQLite roots, then run the inspect command against each. Confirm output includes all required configuration fields and reflects an empty graph state, without exposing raw internal storage paths as the primary identity of the project.

**Acceptance Scenarios**:

1. **Given** a valid JSON-backed project root, **When** the user inspects the project, **Then** output reports project name or identifier, storage type (`json`), storage location (user-meaningful path), configured primitive types or schema reference, and empty graph state.
2. **Given** a valid SQLite-backed project root, **When** the user inspects the project, **Then** output reports the same semantic fields as JSON-backed roots, differing only in storage type (`sqlite`) and storage location appropriate to that backend.
3. **Given** a path that is not an initialized SpecAble project root, **When** the user inspects the project, **Then** the command fails with a clear error explaining that the path is not a valid or complete project root.
4. **Given** a project root with corrupted or incomplete configuration, **When** the user inspects the project, **Then** the command fails with an actionable error identifying what is missing or invalid.

---

### User Story 3 - Storage Backend Parity for Empty Graph Contract (Priority: P3)

A contributor validating alpha behavior needs confidence that JSON and SQLite backends are interchangeable at the semantic layer: both represent the same empty product primitive graph contract so later commands (validation, CRUD, MCP) can target either root without backend-specific behavior at this milestone.

**Why this priority**: The alpha thesis depends on a storage abstraction. Parity at initialization time establishes the foundation that later milestones build on.

**Independent Test**: Initialize one JSON root and one SQLite root. Inspect both and confirm identical semantic empty-graph contract (same primitive type coverage, zero primitives, same schema or ontology version reference) even though on-disk layouts differ.

**Acceptance Scenarios**:

1. **Given** freshly initialized JSON and SQLite project roots, **When** a reviewer compares inspect output for graph state and primitive type configuration, **Then** both roots report the same empty-graph semantic contract.
2. **Given** freshly initialized roots of each storage type, **When** a reviewer examines on-disk artifacts, **Then** JSON layout and SQLite database location each match committed documentation for that backend.
3. **Given** synthetic project names used in demos and documentation, **When** initialization and inspection run, **Then** no real customer data, production credentials, or network services are required.

---

### Edge Cases

- **Target path is a non-empty directory without an existing SpecAble root**: Initialization fails with a clear error; the user is not left with a partial or ambiguous project state.
- **Target path does not exist**: Initialization creates the path (or parent paths as appropriate) and completes successfully, or fails with a clear permissions error.
- **Insufficient filesystem permissions**: Initialization or inspection fails with an actionable error; no silent partial writes.
- **Interrupted initialization**: A subsequent inspect or re-init attempt detects incomplete state and reports it rather than presenting a healthy project.
- **Mixed or manual edits to storage files**: Inspect detects invalid or inconsistent configuration and reports actionable errors rather than undefined behavior.
- **Re-initialization on sibling paths**: Each path maintains independent project identity and storage binding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a CLI command to create a new SpecAble project root at a user-specified local path.
- **FR-002**: The initialization command MUST accept an explicit storage backend selection of `json` or `sqlite`.
- **FR-003**: Initialized project roots MUST persist a stable project configuration that later commands can read without re-deriving state from raw storage files alone.
- **FR-004**: Project configuration MUST include project identity (name or identifier), storage backend type, storage location, primitive type or schema reference, and graph version or empty-state indicator.
- **FR-005**: The JSON storage backend MUST create a documented on-disk file layout for the product primitive graph store at initialization time.
- **FR-006**: The SQLite storage backend MUST create a documented database file at a documented location for the same semantic graph contract at initialization time.
- **FR-007**: Both storage backends MUST expose an identical semantic empty-graph contract immediately after initialization (zero primitives, consistent primitive type or ontology reference).
- **FR-008**: The system MUST provide a CLI inspect command (e.g., `project show`) that reads persisted project configuration and reports project identity, storage type, storage location, primitive types or schema reference, and graph empty state.
- **FR-009**: Initialization MUST fail clearly when the target path is already an initialized SpecAble project root, without overwriting existing data.
- **FR-010**: Initialization MUST fail clearly when the storage type is missing, invalid, or unsupported, listing accepted values.
- **FR-011**: Inspect MUST fail clearly when the target path is not a valid or complete SpecAble project root.
- **FR-012**: All initialization and inspection behavior MUST operate local-first with no network access or external credentials.
- **FR-013**: Demos, documentation, and bundled examples MUST use synthetic project names and local paths only.
- **FR-014**: Product scope MUST be limited to product primitives; design primitives, engineering primitives, and non-product graph types are out of scope.
- **FR-015**: Initialization MAY perform empty-graph sanity checks but MUST NOT implement full graph validation rules (deferred to later milestones).
- **FR-016**: Storage backend mechanics MUST remain behind a pluggable abstraction so consumer commands depend on project-root contracts, not concrete file-loader or database internals.
- **FR-017**: Project root identity and configuration MUST be suitable for future MCP root selection without exposing raw filesystem paths as the canonical project identifier in agent-facing interfaces.

### Key Entities

- **Project Root**: A storage-bound project context comprising identity, configuration, and a graph namespace—not merely a filesystem directory.
- **Project Configuration**: Persisted metadata describing project identity, storage binding, schema or primitive type reference, and graph state/version.
- **Storage Backend Binding**: The association between a project root and either JSON file storage or SQLite database storage, including user-meaningful storage location.
- **Graph Namespace**: The logical container for product primitive instances within a project root; starts empty at initialization.
- **Primitive Type / Schema Reference**: The configured set of product primitive types or ontology version the project honors (aligned with the canonical Product Primitives model from v0).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can initialize a JSON-backed project root and a SQLite-backed project root, inspect both, and complete the documented demo flow in under 5 minutes on a standard developer machine without network access.
- **SC-002**: 100% of required inspect fields (project identity, storage type, storage location, primitive type or schema reference, empty graph state) are present and accurate for both storage backends immediately after initialization.
- **SC-003**: JSON and SQLite roots initialized from the same synthetic project naming conventions expose identical empty-graph semantic contract as reported by the inspect command.
- **SC-004**: All documented initialization failure scenarios (already initialized path, invalid storage type, non-root path on inspect) produce human-readable, actionable error messages without partial or corrupted project state.
- **SC-005**: Committed documentation describes each backend's on-disk layout such that a reviewer can verify file and database locations without reading source code.
- **SC-006**: Subsequent alpha milestones can target either initialized root type as a drop-in project context without backend-specific setup steps beyond storage selection at init time.

## Assumptions

- Users have local filesystem read/write access to their chosen project path.
- The canonical Product Primitives ontology and type definitions established in v0 apply to project configuration and empty-graph contract.
- A single project root per command invocation is sufficient for alpha demos; multi-root server management in one process is out of scope.
- New projects start with an empty graph namespace; optional seed data is not required for this milestone.
- Project configuration format will remain stable enough for later MCP root selection; breaking changes require explicit migration planning in a future milestone.
- JSON and SQLite are the only storage backends required for this milestone; hosted or third-party adapters (Notion, Confluence, etc.) are explicitly out of scope.
- Inspect output is intended for human developers and future agent clients; rich formatting is acceptable as long as required fields are unambiguous.

## Dependencies

- Builds on v0 domain schemas, primitive type definitions, and local-first library patterns where applicable.
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
