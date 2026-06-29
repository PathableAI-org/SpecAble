# Representation Perspectives

**Feature**: `004-readable-semantic-wiki`

Two representation perspectives demonstrate the **same semantic contract** for milestone 2 primitives (SC-002, FR-016).

## Perspective A — Structured storage

**What it is**: A single structured record matching the domain `Primitive` Schema — the form persisted by milestone 2 JSON/SQLite adapters.

**Characteristics**:

- All metadata and short-form body fields (`description`, `definition`, `text`, `sequenceNotes`) live in one object
- Relationship fields are reference arrays with stable IDs
- Directly decodable at the domain boundary via existing domain Schemas
- Proves machine-processability and milestone 2 recoverability

**Location**: [examples/structured-storage/](./examples/structured-storage/)

**Not the target alpha authoring experience** — structured storage is a proving adapter, not the defining wiki UX.

## Perspective B — Human-readable prose

**What it is**: A plain-text document with explicit **Metadata** and **Body** sections using neutral labels (not Markdown frontmatter, Org drawers, or Notion property names).

**Characteristics**:

- Metadata section lists formal fields in a human-scannable block
- Body section expands narrative content
- Same stable IDs and relationship targets as Perspective A
- Readable in any text editor without SpecAble

**Location**: [examples/human-readable/](./examples/human-readable/)

**Syntax is illustrative only** — the contract defines semantic content, not delimiter choice.

## Parity rules

For the same primitive, both perspectives MUST preserve:

| Semantic element | Parity check |
|------------------|--------------|
| `id` | Identical |
| `type` | Identical |
| `name` | Identical |
| `status` | Identical |
| Type-specific formal fields | Semantically equivalent |
| Relationship targets | Same stable IDs and kinds |
| Provenance (`evidence`, etc.) | Same when present |

## Adapter-local identifiers

Perspective A storage MAY include adapter indexing fields (e.g., file path in a manifest) **outside** the primitive record. Perspective B MUST NOT use filename as `id`.

## Example pairing

| Primitive | Structured storage | Human-readable |
|-----------|-------------------|----------------|
| Capability | [cap-schedule-session.json](./examples/structured-storage/cap-schedule-session.json) | [cap-schedule-session.txt](./examples/human-readable/cap-schedule-session.txt) |
| Story | [story-coach-schedules-session.json](./examples/structured-storage/story-coach-schedules-session.json) | [story-coach-schedules-session.txt](./examples/human-readable/story-coach-schedules-session.txt) |
| Actor | [actor-care-coach.json](./examples/structured-storage/actor-care-coach.json) | [actor-care-coach.txt](./examples/human-readable/actor-care-coach.txt) |
| Objective | [obj-improve-coach-utilization.json](./examples/structured-storage/obj-improve-coach-utilization.json) | [obj-improve-coach-utilization.txt](./examples/human-readable/obj-improve-coach-utilization.txt) |

Additional types (Persona, DomainConcept, ExpectedResult, Workflow) follow the same pairing pattern in reference mappings; extend examples directory as needed for SC-001 full coverage.
