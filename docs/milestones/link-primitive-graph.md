# Link primitives into a graph

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The CLI can create typed relationships between primitives and show the
resulting semantic graph structure, proving product meaning lives in
relationships — not only primitive records.

## Why this matters

An AI client that sees isolated records falls back to document interpretation.
This slice makes typed semantic edges explicit and queryable locally.

## Demo

```sh
# Create primitives (or use fixtures), then link
specable relationship link ./demo-json \
  --from <story-id> --to <actor-id> --type story-actor
specable relationship link ./demo-json \
  --from <story-id> --to <capability-id> --type story-capability

specable graph show ./demo-json
specable graph relationships ./demo-json --primitive <story-id>
```

Use synthetic Actor, Capability, Expected Result, Workflow, and Story IDs.

## Expected result

- Typed relationships persist and are readable
- Graph inspect commands show primitives with their semantic edges
- Relationship types align with canonical product primitive ontology

## User-visible or agent-visible behavior

- Link command creates typed edge between two primitives with relationship kind
- Unlink removes a specific relationship (if in scope for this slice)
- Graph show presents structured graph read model (compact form acceptable)
- List relationships by primitive shows inbound/outbound typed edges

## Acceptance criteria

- [ ] Create at least Story→Actor, Story→Capability, Capability→Workflow style links
- [ ] Graph show reflects linked structure with relationship types
- [ ] Relationships queryable by source primitive ID
- [ ] Works on JSON and SQLite roots
- [ ] Demo uses synthetic primitive graph only

## Scope

- Relationship link (and unlink if minimal) CLI commands
- Typed relationship storage in adapters
- Graph read commands: show graph, list relationships

## Out of scope

- Full validation of relationship completeness (next milestone)
- MCP relationship tools
- Cross-root queries

## Dependencies

- [Create and inspect primitives](create-inspect-primitives.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Add CLI commands to **link** and **unlink** typed relationships between product
primitives and to **inspect** the resulting semantic graph. Persist relationship
records through the same storage abstraction as primitives. Expose graph read
models suitable for humans and future MCP graph resources.

### Users / actors

- Engineers modeling product intent as a connected graph
- AI clients (later) reading `specable://graph` and relationship resources

### Required behavior

- Link primitives with explicit relationship type from allowed ontology set
  (e.g., story→actor, story→capability, story→expected-result, story→workflow,
  capability→workflow, capability→expected-result, objective→workflow)
- Reject invalid relationship types or references to unknown primitive IDs
- Unlink removes a specific typed edge without deleting endpoint primitives
- Graph show returns structured read model: primitives plus typed edges
- List relationships for a primitive shows inbound and outbound edges with types
- JSON and SQLite backends preserve identical relationship semantics

### Constraints

- Relationships are first-class semantic data, not inferred-only
- Local-first; synthetic fixtures
- Match canonical Product Primitives ontology relationship kinds

### Non-goals

- Validation failures for incomplete Active graphs (next milestone)
- MCP tools (`link_primitives`, etc.)
- Relationship provenance/confidence metadata beyond alpha needs

### Success definition

Demo links a small synthetic story graph, graph show and relationship listing
match persisted edges, tests cover link/unlink round-trip on both backends.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/3
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/69 (setup)

## Risks or blockers

- Exact alpha mandatory relationship set may be narrowed vs full ontology

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Relationship persistence tests on JSON and SQLite
