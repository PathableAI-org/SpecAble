# Create and inspect primitives

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The CLI can create product primitives, list them, and read them back as
structured graph data from a configured local root — the first visible behavior
of the semantic storage layer without MCP or external planning-tool integration.

## Why this matters

Users must be able to start building desired product state locally. This slice
proves persistence and read models for primitive records before relationships
and validation polish.

## Demo

```sh
# Assuming initialized root from prior milestone
specable primitive create ./demo-json --type capability --name "Schedule session" --status draft
specable primitive list ./demo-json --type capability
specable primitive get ./demo-json --id <capability-id>
```

Repeat with Actor, Objective, or other core types using synthetic names.

## Expected result

- Primitives persist in the configured root (JSON or SQLite)
- List and get return structured records with stable IDs and semantic fields
- Created primitives round-trip through storage without data loss

## User-visible or agent-visible behavior

- Create command accepts primitive type, name, status, and type-specific fields
- List supports filtering by primitive type
- Get returns canonical primitive projection (ID, type, name, status, fields)
- Errors for unknown types, invalid fields, missing root, or duplicate IDs

## Acceptance criteria

- [ ] Create at least two primitive types (e.g., Capability, Actor) in a local root
- [ ] List returns created primitives with stable IDs
- [ ] Get returns full structured record matching create input
- [ ] Works on both JSON and SQLite roots initialized in prior milestone
- [ ] Synthetic data only in demo

## Scope

- Primitive create, list, get CLI commands
- Storage adapter write/read for primitive records
- Stable ID assignment and type-aware field handling for core product primitives

## Out of scope

- Typed relationship edges (next milestone)
- Full validation rule engine (later milestone)
- Update, delete/archive (may be minimal; full lifecycle in MCP milestone)
- MCP exposure

## Dependencies

- [Initialize JSON and SQLite project roots](initialize-project-roots.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Add CLI commands to **create**, **list**, and **get** product primitives within
an initialized SpecAble project root. Primitives persist through the storage
abstraction (JSON or SQLite). Support core alpha product primitive types at
minimum: Objective, Actor, Persona, Domain Concept, Capability, Expected
Result, Workflow, Story.

### Users / actors

- Product owners and engineers modeling desired state locally
- Developers testing storage adapters
- Future MCP tools delegating to the same library operations

### Required behavior

- Create primitive with type, display name, status (`Draft`/`Active`/`Deprecated`), and required semantic fields per type
- Assign stable primitive IDs on create
- List primitives with optional type filter; return summary fields suitable for orientation
- Get primitive by ID; return canonical read projection
- Operations are root-scoped (explicit project path or active root context)
- JSON and SQLite backends behave identically at the semantic API boundary
- Decode/validation errors report field paths and primitive type

### Constraints

- Product primitives only
- Local-first; synthetic demo data
- Graph remains source of truth; no prose-only side stores
- Typed errors; Effect services for storage

### Non-goals

- Relationship create/link
- Graph-wide validation or integrity heuristics
- MCP resources/tools
- Product Decision, Product Risk, Evidence (unless explicitly added later)

### Success definition

Demo commands create, list, and get primitives on both storage backends with
matching structured output and automated tests at storage boundary.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/2
- Spec Kit spec: [specs/003-create-inspect-primitives/spec.md](../../specs/003-create-inspect-primitives/spec.md)
- Issues: https://github.com/PathableAI-org/SpecAble/issues/68 (setup)

## Risks or blockers

- Minimum required fields per primitive type must be decided before Active status enforcement

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Storage round-trip tests for create/list/get
