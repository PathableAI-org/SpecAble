# Validate desired product state

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The CLI can run validation rules against the primitive graph and return
structured issues for missing, inconsistent, duplicated, or underspecified
desired-state information — guiding refinement without an LLM or MCP client.

## Why this matters

SpecAble must help teams improve structured product state, not only store it.
This slice proves validation as a first-class feedback loop on the persistent
graph (extending v0 read-only validation concepts to alpha CRUD graphs).

## Demo

```sh
# Graph with deliberate gaps (Draft warnings vs Active failures)
specable validate ./demo-json
specable validate ./demo-json --format json

# Show validation issues with severity, primitive IDs, rule, suggested action
```

Include one graph that passes Active checks and one with known failures.

## Expected result

- Validation returns structured issues: ID, severity, affected primitives, rule,
  human explanation, suggested next action
- Draft incompleteness warns; Active violations fail appropriately
- Output usable by humans and AI tools (JSON + human-readable)

## User-visible or agent-visible behavior

- Validate command runs status-aware rules on persisted graph in root
- Issues distinguish warnings vs failures per alpha policy
- Broken references and duplicate IDs reported with stable issue IDs
- Validation does not mutate graph state

## Acceptance criteria

- [ ] Active primitive missing required relationship produces validation failure
- [ ] Draft primitive missing links produces warning not hard failure
- [ ] Broken reference to unknown ID reported as failure
- [ ] JSON output includes issue ID, severity, primitive IDs, rule, explanation
- [ ] Integrity-style heuristics (duplicate names, orphans) reported separately from Active field failures where applicable
- [ ] Works on graphs created via prior milestones (not fixture-only)

## Scope

- `specable validate` (or equivalent) on persistent project roots
- Status-aware validation rules for core product primitives
- Structured validation issue model aligned with future `specable://validation/*` resources
- Reuse/extend v0 validation logic adapted to storage-backed graph

## Out of scope

- MCP validation resources exposure (later milestones)
- Automatic validation after every mutation (open question; manual validate OK for slice)
- Design/engineering primitive rules

## Dependencies

- [Link primitives into a graph](link-primitive-graph.md)
- v0 validation rules and severity policy as reference (`specs/001-product-primitives-v0/`)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Add CLI **graph validation** for SpecAble project roots with persisted
primitives and relationships. Return structured validation issues that guide
desired-state refinement: issue ID, severity, affected primitive IDs, violated
rule, human-readable explanation, suggested next action, and whether the issue
blocks downstream handoff. Apply status-aware strictness (`Draft` warns,
`Active` fails for required fields/relationships). Adapt proven v0 ontology
rules to the storage-backed graph model.

### Users / actors

- Engineers refining a product graph before sharing or MCP exposure
- AI clients (later) reading validation resources and calling `validate_graph`

### Required behavior

- Validate entire graph in a root; no network required
- Report broken references, duplicate IDs, Active under-linked primitives as failures
- Report Draft incompleteness and advisory quality flags as warnings
- Separate integrity heuristics (duplicate names, orphans, workflow derivability)
  from Active validation failures without duplicating failures across artifacts
- Emit human-readable summary and machine-readable JSON
- Exit code policy consistent with v0 where applicable (`0`/`1`/`2`)
- Validation read model stable enough to back future MCP validation resources

### Constraints

- Validation read-only; does not auto-fix graph
- Synthetic demo graphs only
- Product primitives only; canonical ontology without reduced model

### Non-goals

- MCP `validate_graph` tool (later)
- Elicitation or LLM-driven repair
- Hosted multi-user validation workflows

### Success definition

Demo shows pass and fail graphs with structured issues; tests cover representative
Active failure, Draft warning, and broken reference paths on persisted storage.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: TBD
- Spec Kit spec: TBD
- Issues: TBD

## Risks or blockers

- Split between v0 fixture-loader validation and alpha storage graph may need shared library module

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Validation tests on storage-backed graphs
