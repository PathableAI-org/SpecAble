# Feature Specification: Create and Inspect Primitives

**Feature Branch**: `003-create-inspect-primitives`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "Create and inspect primitives — the CLI can create product primitives, list them, and read them back as structured graph data from a configured local root, proving persistence and read models for primitive records before relationships and validation polish."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Product Primitive (Priority: P1)

A product owner or engineer modeling desired product state locally runs a create command against an initialized project root. They specify a primitive type, display name, status, and any required semantic fields for that type. The system persists the new primitive in the project's graph store and returns a stable identifier the user can reference in later commands.

**Why this priority**: Creation is the first step toward building a durable product graph. Without it, initialized project roots remain empty and no alpha workflow can capture product intent.

**Independent Test**: Initialize a local project root (JSON or SQLite), create at least two different primitive types (for example Capability and Actor) with synthetic names, and confirm each command succeeds with a stable ID and no data loss when the record is read back.

**Acceptance Scenarios**:

1. **Given** a valid initialized JSON-backed project root, **When** the user creates a Capability with display name and status `Draft`, **Then** the primitive is persisted and the command reports a stable primitive ID.
2. **Given** a valid initialized SQLite-backed project root, **When** the user creates an Actor with display name and status `Draft`, **Then** the primitive is persisted with the same semantic outcome as the JSON backend.
3. **Given** a supported primitive type, **When** the user supplies all required semantic fields for that type at `Draft` status, **Then** the created record round-trips through storage with matching type, name, status, and fields.
4. **Given** an unsupported or unknown primitive type, **When** the user attempts to create a primitive, **Then** the command fails with a clear error naming supported types.
5. **Given** invalid or missing required fields for the chosen type, **When** the user attempts to create a primitive, **Then** the command fails with field-path-specific validation errors and no partial record is persisted.
6. **Given** a path that is not a valid initialized project root, **When** the user attempts to create a primitive, **Then** the command fails with an actionable error explaining the missing or invalid root.

---

### User Story 2 - List Primitives in a Project Root (Priority: P2)

After creating primitives, a developer or future agent client needs to orient themselves within a project. They run a list command scoped to a project root, optionally filtering by primitive type, and receive summary records suitable for discovery without loading full detail for every primitive.

**Why this priority**: Listing proves that persisted primitives are queryable as structured graph data and supports demos and downstream tooling that need orientation before deep reads.

**Independent Test**: Create several primitives of different types in one root, run list without a filter and with a type filter, and confirm results include stable IDs and summary fields while excluding primitives that do not match the filter.

**Acceptance Scenarios**:

1. **Given** a project root containing multiple persisted primitives, **When** the user lists primitives without a type filter, **Then** all created primitives appear with stable IDs and summary fields (type, name, status at minimum).
2. **Given** a project root containing primitives of multiple types, **When** the user lists primitives filtered by one type (for example Capability), **Then** only primitives of that type are returned.
3. **Given** an initialized but empty project root, **When** the user lists primitives, **Then** the command succeeds with an empty result set and a clear indication that no primitives exist.
4. **Given** a path that is not a valid initialized project root, **When** the user attempts to list primitives, **Then** the command fails with an actionable error.

---

### User Story 3 - Get a Primitive by ID (Priority: P3)

When a user or agent knows a primitive ID (from create output or list results), they run a get command to retrieve the canonical read projection: identifier, type, display name, status, and all persisted semantic fields for that record.

**Why this priority**: Get completes the create–list–get loop and proves that storage read models match what was written, which is prerequisite for relationships, validation, and agent access in later milestones.

**Independent Test**: Create a primitive, capture its ID, run get by that ID, and confirm the returned structured record matches create input across both JSON and SQLite roots.

**Acceptance Scenarios**:

1. **Given** a persisted primitive ID in a valid project root, **When** the user gets the primitive by ID, **Then** the command returns the full canonical projection matching what was stored at create time.
2. **Given** a primitive ID that does not exist in the project root, **When** the user attempts to get the primitive, **Then** the command fails with a clear not-found error.
3. **Given** JSON and SQLite project roots each containing the same synthetic create inputs (separate roots), **When** the user gets the corresponding primitives by ID, **Then** both backends return semantically equivalent structured records at the read boundary.
4. **Given** a path that is not a valid initialized project root, **When** the user attempts to get a primitive, **Then** the command fails with an actionable error.

---

### Edge Cases

- **Duplicate primitive ID collision on create**: The system detects the conflict and fails with a clear error rather than silently overwriting an existing record.
- **Invalid status value**: Create fails with a validation error listing accepted status values (`Draft`, `Active`, `Deprecated`).
- **Type-specific field present but wrong shape**: Validation reports the offending field path and primitive type; no record is persisted.
- **Optional type-specific fields omitted at Draft status**: Create succeeds when minimum required fields for `Draft` are satisfied; stricter Active-status field requirements are deferred to a later milestone.
- **List filter for type with no matches**: Command succeeds with an empty result set.
- **Get with malformed ID format**: Command fails with a clear validation error before storage lookup.
- **Concurrent creates in separate processes**: Each successful create receives a distinct stable ID; last-write conflicts on the same ID are rejected.
- **Manual corruption of storage files**: Get or list may fail with actionable decode errors rather than undefined behavior.
- **Legacy v0 fixture directory without project manifest**: Create, list, and get fail because the path is not a valid initialized project root.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose primitive creation through a CLI command and MUST implement create behavior in a reusable library operation callable by future surfaces (for example MCP tools).
- **FR-002**: The create command MUST accept a project root path, primitive type, display name, status (`Draft`, `Active`, or `Deprecated`), and type-specific semantic fields required for the chosen type at the requested status.
- **FR-003**: On successful create, the system MUST assign and persist a stable primitive identifier unique within the project root and return that identifier to the caller.
- **FR-004**: The system MUST support creation for these core alpha product primitive types at minimum: Objective, Actor, Persona, Domain Concept, Capability, Expected Result, Workflow, and Story.
- **FR-005**: The system MUST expose primitive listing through a CLI command and MUST implement list behavior in the same reusable library layer as create.
- **FR-006**: The list command MUST accept a project root path and an optional primitive-type filter; when no filter is supplied, all persisted primitives in the root MUST be included.
- **FR-007**: List results MUST include stable IDs and summary fields sufficient for orientation (primitive type, display name, and status at minimum).
- **FR-008**: The system MUST expose primitive retrieval through a CLI command and MUST implement get behavior in the same reusable library layer as create and list.
- **FR-009**: The get command MUST accept a project root path and primitive ID and MUST return the canonical read projection: ID, type, display name, status, and all persisted semantic fields for that record.
- **FR-010**: All create, list, and get operations MUST be scoped to an explicit project root path supplied by the caller.
- **FR-011**: JSON and SQLite storage backends initialized in the prior milestone MUST behave identically at the semantic create, list, and get boundary; swapping storage type MUST NOT change command semantics.
- **FR-012**: Validation and decode failures MUST report primitive type and field paths in human-readable, actionable error messages.
- **FR-013**: Create MUST fail clearly for unknown primitive types, invalid field values, missing required fields, invalid project roots, and duplicate identifier conflicts without persisting partial records.
- **FR-014**: List and get MUST fail clearly for invalid project roots; get MUST fail clearly when the requested ID does not exist.
- **FR-015**: Persisted primitives MUST be stored as structured graph records in the project's configured storage; prose-only side stores MUST NOT be introduced.
- **FR-016**: All create, list, and get behavior MUST operate local-first with no network access or external credentials.
- **FR-017**: Demos, documentation, and automated tests MUST use synthetic primitive names and local project paths only.
- **FR-018**: Product scope MUST be limited to product primitives; Product Decision, Product Risk, and Evidence types are out of scope unless explicitly added in a later milestone.
- **FR-019**: Storage read and write mechanics MUST remain behind the existing storage abstraction; create, list, and get consumers MUST depend on typed storage operations, not on backend-specific file or SQL details.
- **FR-020**: Create, list, and get library operations MUST be testable independently of CLI execution through the same storage contracts used by the CLI.

### Key Entities

- **Product Primitive**: A typed node in the product graph representing durable product intent (for example a Capability or Actor) with display name, status, and type-specific semantic fields.
- **Primitive Identifier**: A stable, unique ID assigned at create time and used for get and future relationship operations within a project root.
- **Project Root**: An initialized local SpecAble project context (from the prior milestone) binding configuration to either JSON or SQLite graph storage.
- **Canonical Read Projection**: The full structured view of a primitive returned by get—ID, type, name, status, and all persisted fields—without backend-specific encoding details.
- **List Summary**: A lightweight primitive view returned by list—stable ID plus orientation fields (type, name, status)—without requiring a full get for every record.
- **Primitive Status**: One of `Draft`, `Active`, or `Deprecated`; governs lifecycle semantics with full Active-status field enforcement deferred to later milestones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can run the documented demo flow—create, list, and get—for at least two primitive types on a JSON-backed root and a SQLite-backed root in under 10 minutes on a standard developer machine without network access.
- **SC-002**: 100% of create inputs for supported types at `Draft` status round-trip through get with matching type, display name, status, and semantic fields on both storage backends.
- **SC-003**: List without filter returns all created primitives; list with a type filter returns only matching types with zero false positives in automated tests.
- **SC-004**: All documented failure scenarios (unknown type, invalid fields, missing root, missing ID on get, duplicate ID) produce human-readable errors that identify primitive type and/or field paths where applicable.
- **SC-005**: JSON and SQLite roots receiving equivalent synthetic create inputs expose semantically identical list and get results at the read boundary.
- **SC-006**: Automated storage-boundary tests cover create, list, and get for at least two primitive types on each backend without requiring CLI execution.
- **SC-007**: Subsequent alpha milestones can reference created primitive IDs as stable graph nodes without backend-specific setup or migration steps.

## Assumptions

- Users have already initialized a valid project root using the prior milestone; this feature does not redefine initialization behavior.
- Minimum required semantic fields per primitive type follow the canonical Product Primitives ontology established in v0; only `Draft`-status minimums are enforced in this milestone.
- Stricter field requirements for `Active` or `Deprecated` status are deferred until minimum-field decisions are finalized (see milestone risks).
- A single explicit project path per command invocation is sufficient for alpha demos; implicit "active root" context selection is out of scope.
- Primitive IDs are opaque stable strings generated by the system; callers do not supply IDs at create time unless a future milestone explicitly adds that capability.
- Update, delete, archive, and relationship operations are intentionally absent; users recreate or defer changes until later milestones.
- Eight core alpha types listed in scope are sufficient for this milestone; the ninth v0 type (Product Experience Context) may be added in a follow-on slice if needed before relationship work.

## Dependencies

- Requires completed [Initialize JSON and SQLite project roots](../002-initialize-project-roots/spec.md): valid `specable.json` manifest, JSON and SQLite storage backends, and empty-graph contract.
- Builds on v0 domain schemas and primitive type definitions for field shapes and validation messages.
- Relationship management, graph-wide validation, integrity heuristics, MCP exposure, and full primitive lifecycle (update/delete) are explicitly deferred to later milestones.

## Out of Scope

- Creating or querying typed relationship edges between primitives.
- Graph-wide validation rule engine or integrity heuristics beyond field-level create validation.
- Update, delete, or archive commands (minimal or full lifecycle deferred to MCP milestone).
- MCP resources, tools, or server protocol integration.
- Product Decision, Product Risk, and Evidence primitive types.
- Hosted storage adapters, network sync, or multi-user collaboration.
- Wiring `specable check` to alpha project roots or validating cross-primitive graph integrity.
- Prose-only artifact stores that bypass the primitive graph.
