# Initialize JSON and SQLite project roots

**Release:** [docs/releases/alpha.md](../../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

The CLI can initialize and inspect local SpecAble project roots backed by either
JSON files or a SQLite file, proving that a SpecAble root is a project context
bound to a storage backend — not hard-coded to one persistence format.

## Why this matters

Without project roots and storage backends, alpha cannot demonstrate persistent
desired product state. This slice establishes the foundation every later alpha
milestone depends on.

## Demo

```sh
# Initialize a JSON-backed project root
specable init ./demo-json --storage json

# Initialize a SQLite-backed project root
specable init ./demo-sqlite --storage sqlite

# Inspect configured root (project identity, storage adapter, empty graph state)
specable project show ./demo-json
specable project show ./demo-sqlite
```

Show project configuration, storage file layout, and an empty (or seed) graph
namespace. Use synthetic project names only.

## Expected result

- Two local project roots exist with distinct storage backends
- Each root exposes project identity, storage adapter type, and graph namespace
- Both backends honor the same semantic graph contract (empty graph initially)
- A user can inspect root configuration without MCP or external services

## User-visible or agent-visible behavior

- `specable init` creates a SpecAble project with explicit storage backend selection
- `specable project show` (or equivalent) prints project config and storage binding
- JSON root writes expected directory/file layout; SQLite root writes a database file
- Errors are actionable when path exists, storage type invalid, or init incomplete

## Acceptance criteria

- [ ] JSON-backed root initializes with documented file layout
- [ ] SQLite-backed root initializes with documented database location
- [ ] Both roots expose the same empty-graph semantic contract
- [ ] Project configuration is readable via CLI inspect command
- [ ] Demo uses synthetic project names and local paths only
- [ ] No network or external credentials required

## Scope

- Project root initialization CLI
- JSON local storage backend bootstrap
- SQLite local storage backend bootstrap
- Project configuration format and inspect command
- Storage adapter abstraction entry point

## Out of scope

- Primitive CRUD (next milestone)
- Validation rules beyond empty-graph sanity checks
- MCP server exposure
- Notion/Confluence/hosted storage adapters

## Dependencies

- None identified (first alpha vertical slice)
- Builds on v0 domain schemas and library patterns where applicable

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Add CLI commands to initialize and inspect SpecAble **project roots** with a
pluggable storage abstraction. Alpha must support **local JSON files** and
**local SQLite** as first-class backends. A root is a storage-bound project
context (project identity, storage adapter, graph namespace, ontology/schema
version reference) — not merely a filesystem directory.

### Users / actors

- Local developers setting up a SpecAble project for iteration
- Contributors testing alpha behavior with synthetic projects
- Future MCP server (reads same root configuration)

### Required behavior

- CLI can create a new project root selecting `json` or `sqlite` storage
- Initialized roots persist project configuration readable by later commands
- JSON backend uses a documented on-disk layout for the primitive graph store
- SQLite backend uses a documented database file for the same semantic contract
- CLI can inspect a root and report: project name/id, storage type, storage
  location, configured primitive types (or schema reference), graph version/empty state
- Both backends expose identical semantic empty-graph contract to upstream layers
- Fail clearly when target path already initialized or storage type unsupported

### Constraints

- Local-first; no cloud or external credentials
- Synthetic examples only in docs and demos
- Storage abstraction must not leak into MCP resource URIs as raw file paths
- Align with constitution: repository/storage behind Effect services and Layers
- Product primitives only (no design/engineering graph types)

### Non-goals

- Primitive create/read/update/delete
- Relationship management
- Graph validation beyond init-time checks
- MCP protocol integration
- Multi-root server management in one process (single root per demo is sufficient)

### Success definition

Reviewer runs init + inspect for JSON and SQLite roots, confirms documented
layouts and identical empty-graph contract, and can point subsequent milestones
at either root.

## Links

- Release: [docs/releases/alpha.md](../../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/1
- Spec Kit spec: `specs/002-initialize-project-roots/`
- Issues: https://github.com/PathableAI-org/SpecAble/issues/17 (setup), https://github.com/PathableAI-org/SpecAble/issues?q=is%3Aissue+milestone%3A%22Alpha+1%3A+Initialize+JSON+and+SQLite+project+roots%22 (tasks)

## Risks or blockers

- Project configuration file format must remain stable for later MCP root selection

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Documented project config and storage layouts committed with tests
