# Feature Specification: Readable Semantic Wiki

**Feature Branch**: `004-readable-semantic-wiki`

**Created**: 2026-06-29

**Status**: Draft

**Input**: Milestone: [docs/milestones/alpha/003-readable-semantic-wiki.md](../../docs/milestones/alpha/003-readable-semantic-wiki.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize a human-readable wiki project (Priority: P1)

A product owner or engineer wants to create a new SpecAble project where product primitives are stored as individual, human-readable files they can open and edit in any text editor. They choose either Markdown (`--storage md`) or Org mode (`--storage org`) format.

**Why this priority**: This is the entry point for the entire wiki workflow. Without project initialization, no primitives can be created or read in the wiki format. It also proves the storage backends are wired end-to-end.

**Independent Test**: Run `specable init ./demo-wiki --storage md` and verify a project root is created with per-type directories (capabilities/, actors/, etc.) and a `specable.json` recording `"storage": {"type": "md", "location": "."}`. Repeat with `--storage org` and confirm the same per-type directories with `.org` file extension expected. Can be fully tested by file system inspection without creating any primitives.

**Acceptance Scenarios**:

1. **Given** no existing project at the target path, **When** the user runs `specable init ./my-project --storage md`, **Then** a project root is created with per-type directories (`capabilities/`, `actors/`, `objectives/`, `personas/`, `domain-concepts/`, `expected-results/`, `workflows/`, `stories/`, `capability-concept-links/`) and a `specable.json` manifest recording `"storage": {"type": "md", "location": "."}`.
2. **Given** no existing project at the target path, **When** the user runs `specable init ./my-project --storage org`, **Then** a project root is created with the same per-type directory layout and a `specable.json` manifest recording `"storage": {"type": "org", "location": "."}`.
3. **Given** no existing project, **When** the user runs `specable init ./my-project --storage json` or `--storage sqlite`, **Then** the existing JSON and SQLite backends continue to work with no behavior change.
4. **Given** a project already exists at the target path, **When** the user attempts init, **Then** the command fails with a clear error explaining the path is already initialized.
5. **Given** `specable init --storage md`, **When** init completes, **Then** `specable project show` reports the storage type as `md` and confirms the wiki file layout.

---

### User Story 2 - Create primitives as readable wiki files (Priority: P1)

A product owner creates a product primitive (e.g., a Capability, Actor, or Story) using the CLI, and the system writes it as a standalone Markdown or Org file with structured metadata (frontmatter or property drawer) and a prose body. The file is immediately readable in any text editor.

**Why this priority**: Primitive creation is the core write path. Without it, the wiki is an empty shell. Combined with User Story 1, this delivers the full create-and-read-authoring loop.

**Independent Test**: Run `specable init ./demo --storage md`, then `specable primitive create ./demo --type Capability --name "Schedule session" --status Draft`. Verify a file `<id>.md` exists in `capabilities/` with YAML frontmatter containing id, type, name, and status. Open it in a text editor and confirm it is human-readable. Repeat with `--storage org` and verify `<id>.org` with a property drawer.

**Acceptance Scenarios**:

1. **Given** a Markdown-backed project root, **When** the user creates a Capability primitive with name "Schedule session" and status "Draft", **Then** a file `<id>.md` is written in `capabilities/` with YAML frontmatter containing `id`, `type`, `name`, `status`, and type-specific relationship fields (actors, expectedResults, workflows, domainConcepts) — all decodable back to the domain schema.
2. **Given** an Org-backed project root, **When** the user creates the same Capability primitive, **Then** a file `<id>.org` is written in `capabilities/` with an Org property drawer containing the same structured metadata fields — all decodable back to the domain schema.
3. **Given** a wiki-backed project, **When** the user creates a primitive of any supported type (Actor, Persona, Domain Concept, Workflow, Story, etc.), **Then** the file lands in the correct per-type directory with the correct extension and decodable metadata.
4. **Given** a wiki-backed project, **When** the user creates a primitive with prose body content, **Then** that body is preserved as-is below the frontmatter/property drawer on round-trip, with no encoding transformations applied.
5. **Given** a wiki-backed project, **When** a primitive is created, **Then** its ID is derived from the primitive name in a sanitized, filesystem-safe format and is stable across renames (the ID does not change when the display name changes).

---

### User Story 3 - List and retrieve primitives from a wiki project (Priority: P1)

A product owner or developer wants to list all primitives in a wiki-backed project and retrieve individual primitives by ID — just as they would with JSON or SQLite backends.

**Why this priority**: List and get complete the read path. Without them, created primitives are write-only and the wiki provides no value over manual file management. This proves the storage contract works identically across all four backends.

**Independent Test**: Create several primitives on a Markdown-backed project, run `specable primitive list`, and verify correct summaries (id, type, name, status). Run `specable primitive get --id <id>` and verify full decoded primitive data matches what was written. Repeat on an Org-backed project with identical results.

**Acceptance Scenarios**:

1. **Given** a Markdown-backed project with multiple primitives across different types, **When** the user runs `specable primitive list`, **Then** all primitives are returned as summaries with id, type, name, and status — no primitives are missing and no file-level artifacts appear.
2. **Given** a Markdown-backed project, **When** the user runs `specable primitive get --id cap-schedule-session`, **Then** the full decoded Capability primitive is returned with all metadata fields and body prose intact.
3. **Given** an Org-backed project with the same primitives, **When** the user runs `specable primitive list` and `specable primitive get`, **Then** the same structured data is returned — semantic parity with the Markdown backend.
4. **Given** a wiki-backed project, **When** the user requests a primitive by an ID that does not exist, **Then** the command returns a clear error indicating the primitive was not found.
5. **Given** a wiki-backed project with a primitive whose file has valid frontmatter/properties but malformed body content, **When** the user lists or gets primitives, **Then** the malformed body is preserved as-is (body is never validated or transformed by the backend).

---

### User Story 4 - Edit wiki files manually and re-read with SpecAble (Priority: P2)

A product owner opens a wiki file in a plain text editor, edits the body prose (or non-identity metadata fields), and saves it. When they re-run `specable primitive get`, the changes are reflected without breaking identity or requiring re-creation.

**Why this priority**: The defining value of wiki storage is human editability outside the tool. This story validates that round-tripping through manual edits works correctly. It is P2 because the core read/write CLI path (P1) already proves structural round-trip; this adds manual-edit resilience.

**Independent Test**: Create a primitive via CLI, open the resulting .md file in a text editor, change the body prose and save. Run `specable primitive get --id <id>` and confirm the updated body is returned, while id, type, and status remain as they were. Repeat with an .org file.

**Acceptance Scenarios**:

1. **Given** a Markdown-backed project with an existing Capability .md file, **When** the user opens the file in a text editor, modifies the body prose, and saves, **Then** `specable primitive get --id <id>` returns the updated body while preserving id, type, status, and relationship fields.
2. **Given** an Org-backed project with an existing Capability .org file, **When** the user edits the body prose manually, **Then** `specable primitive get --id <id>` returns the updated body with all metadata preserved.
3. **Given** a wiki-backed project, **When** the user edits the display name in the body prose area (not the frontmatter `name` field), **Then** the metadata `name` remains unchanged — body edits do not alter structured metadata.
4. **Given** a wiki-backed project, **When** a manually-edited file has malformed YAML frontmatter or Org property drawer syntax, **Then** `specable primitive get` and `list` report a clear decoding error identifying which file failed and what property was malformed, rather than silently skipping or crashing.

---

### User Story 5 - Prove backend parity across all four storage types (Priority: P2)

A developer runs the same suite of storage round-trip tests against JSON, SQLite, Markdown, and Org backends. All four backends produce semantically identical results for create, list, and get operations, confirming the StorageBackend contract is format-independent.

**Why this priority**: This story proves the architectural thesis that the StorageBackend contract cleanly abstracts storage format without semantic leakage. It is P2 because the individual backends are validated in P1 stories, but the parity proof is a quality gate for the milestone.

**Independent Test**: Run the storage round-trip test suite with test Layers for all four backends. Assert that primitive create, list, and get produce the same decoded domain values regardless of whether the backing format is JSON, SQLite, Markdown, or Org.

**Acceptance Scenarios**:

1. **Given** the storage round-trip test suite, **When** tests run against the JSON, SQLite, Markdown, and Org backends, **Then** all tests pass with no backend-specific test branches (the same assertions hold for all four).
2. **Given** a primitive created via each backend with the same input, **When** the primitive is read back via `get`, **Then** the decoded domain values are identical across all four backends.
3. **Given** the test suite, **When** a new primitive type is added to the domain, **Then** each backend is tested for that type without requiring new backend-specific test logic.

---

### Edge Cases

- **Empty wiki project**: What happens when `list` is called on a newly initialized wiki project with no primitives? Returns an empty list with no errors.
- **File naming collisions**: What happens when two primitives would produce the same sanitized file name? The creation or init system must detect collisions and report a clear error rather than silently overwriting.
- **Filesystem-invalid characters in names**: What happens when a primitive name contains characters invalid for file names (e.g., `/`, `null`)? ID assignment must sanitize the ID to be filesystem-safe, or reject names that cannot produce valid IDs.
- **YAML frontmatter with special characters**: What happens when metadata values contain YAML-significant characters (colons, hashes, quotes)? The YAML encoder must properly escape or quote values to produce valid YAML.
- **Org property drawer with colon in values**: What happens when a metadata value contains a colon? The property drawer parser must handle escaped or quoted colons correctly.
- **Multi-line body prose**: What happens with multi-paragraph body content in both Markdown and Org files? The body is preserved exactly, including blank lines and formatting.
- **Missing frontmatter / property drawer**: What happens when a wiki file has no frontmatter or property drawer at all? The decoder reports a clear error identifying the missing structured metadata.
- **Malformed frontmatter YAML**: What happens when YAML frontmatter has syntax errors? The decoder reports a parse error with the file path and the specific YAML error, not a generic failure.
- **File extension mismatch**: What happens when an .md file exists in an org-backed project (or vice versa)? The backend only scans files matching its expected extension in each type directory.
- **Large numbers of primitives**: What happens when a project has hundreds of primitives across multiple types? List must scan all type directories and return results efficiently without hitting system file-descriptor limits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support two new storage types: `"md"` (Markdown) and `"org"` (Org mode), alongside existing `"json"` and `"sqlite"` types.
- **FR-002**: System MUST implement a `MarkdownStorageBackend` that satisfies the existing `StorageBackend` contract (bootstrap, describe, create, list, get) using per-type directories of `.md` files with YAML frontmatter.
- **FR-003**: System MUST implement an `OrgStorageBackend` that satisfies the same `StorageBackend` contract using per-type directories of `.org` files with Org property drawers.
- **FR-004**: System MUST encode each primitive's structured metadata (id, type, name, status, and type-specific fields) in YAML frontmatter (Markdown) or Org property drawers (Org) using the same `schemaByType` registry from `@specable/domain`.
- **FR-005**: System MUST map each primitive type to a consistent directory name (e.g., `Capability` → `capabilities/`, `Actor` → `actors/`) and file extension (`.md` or `.org`) via a shared wiki file-layout module.
- **FR-006**: System MUST route storage operations to the correct backend implementation based on `config.storage.type` in `specable.json`, using the existing `RoutedStorageBackend` pattern.
- **FR-007**: System MUST support `specable init --storage md` and `specable init --storage org` to create wiki-backed project roots with per-type directories and an empty `specable.json`.
- **FR-008**: System MUST support `specable primitive create`, `specable primitive list`, and `specable primitive get` on wiki-backed project roots with identical CLI behavior to JSON and SQLite backends.
- **FR-009**: System MUST preserve body prose as-is on round-trip — no body-level encoding, transformation, validation, or parsing.
- **FR-010**: System MUST derive file names from stable primitive IDs (not display names) to ensure file identity survives renames.
- **FR-011**: System MUST enforce filesystem-safe characters in primitive IDs at creation time — rejecting or sanitizing names that would produce invalid file paths.
- **FR-012**: System MUST NOT embed adapter-specific identifiers (file paths, row keys) as the canonical primitive identity; the semantic ID stored in metadata is the authoritative identity.
- **FR-013**: System MUST provide clear, typed error messages for decode failures (malformed YAML, malformed property drawer, missing frontmatter, schema violations) that identify the affected file and the specific property or syntax issue.
- **FR-014**: System MUST leave existing JSON and SQLite backends fully operational and unchanged — all four backends coexist without modifying existing behavior.
- **FR-015**: System MUST provide storage round-trip tests covering all alpha primitive types on both Markdown and Org backends, asserting semantic parity with JSON and SQLite.

### Key Entities

- **MarkdownStorageBackend**: An implementation of `StorageBackend` that reads/writes `.md` files with YAML frontmatter. Manages per-type directories and encodes/decodes primitives through the shared wiki file-layout and schema-wiring modules.
- **OrgStorageBackend**: An implementation of `StorageBackend` that reads/writes `.org` files with Org property drawers. Shares the wiki file-layout logic with the Markdown backend.
- **Wiki File Layout**: A shared module providing the mapping from primitive types to directory names, file naming conventions (ID-to-filename), and filesystem-safe name sanitization used by both backends.
- **Semantic Document**: A single `.md` or `.org` file representing exactly one product primitive. Contains structured metadata (frontmatter or property drawer) and a free-form prose body. The durable, human-facing unit of product knowledge.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can run `specable init --storage md`, create a primitive, open the resulting `.md` file in any text editor, and confirm it is readable as a standalone document — without ever running SpecAble to interpret the content.
- **SC-002**: The same primitive created on a Markdown and an Org backend produces semantically identical decoded domain values — `specable primitive get` returns matching id, type, name, status, and type-specific fields regardless of storage format.
- **SC-003**: All four storage backends (JSON, SQLite, Markdown, Org) pass the same round-trip test suite with zero backend-specific test branches — a single set of assertions validates all four.
- **SC-004**: A manually-edited wiki file (body prose changed, metadata preserved) is correctly re-read by `specable primitive get` with the updated body and unchanged metadata fields.
- **SC-005**: A malformed wiki file (broken YAML, missing property drawer) produces a specific, actionable error message identifying the file path and the nature of the problem — not a generic failure or silent skip.
- **SC-006**: Existing JSON and SQLite backends continue to pass all existing tests with no regression or behavior change.
- **SC-007**: Creating a primitive with a name containing filesystem-unsafe characters either produces a valid, sanitized ID (failing safely) or is rejected with a clear error — no corrupted or inaccessible files are created.

## Assumptions

- A YAML parsing library (e.g., `js-yaml`) is added as a dependency scoped to the Markdown backend. The library is well-established and lightweight.
- Org property drawer parsing covers only the flat key-value subset (property name and value per line), not nested drawers, multi-line values beyond simple flow, or Emacs-specific binary formats. A lightweight regex-based parser is sufficient for this subset.
- The `StorageBackend` contract's existing `bootstrap`, `describe`, `create`, `list`, and `get` method signatures accommodate file-based backs without modification — the contract already abstracts over storage mechanics.
- Primitive IDs generated by the domain are already filesystem-safe for the typical set of allowed characters (alphanumeric, hyphens, underscores). A sanitization layer in the wiki file-layout module provides an additional safety net.
- The per-type directory names follow a consistent convention (pluralized, kebab-case) mapping from the canonical type names defined in `@specable/domain`.
- Body prose is treated as opaque text — no Markdown or Org rendering, validation, or transformation is applied. The backend stores and retrieves it verbatim.
- Relationship references in frontmatter/property drawers use stable primitive IDs, not file paths or wiki links. Resolution of those references belongs to the interpretation layer (next milestone), not this milestone.
- The existing `RoutedStorageBackend` and `PrimitiveService` implementations do not need structural changes — adding new backends is purely additive wiring.
- Synthetic demo data is used for all examples, tests, and documentation. No real product data is involved.
