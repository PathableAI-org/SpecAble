# Local MCP server for desired product state

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The alpha MCP server operates against a configured project root, exposes the
product primitive graph as semantic resources, provides tools for CRUD and
relationship management, **validates graph integrity**, and generates **basic
projections** of the current desired product state — proving the MVP thesis end
to end.

## Why this matters

This is the **final alpha vertical slice**. It demonstrates that AI clients can
help a team iteratively refine structured product intent through an embedded
semantic storage layer rather than scattered planning prose.

## Demo

```sh
specable mcp serve --root ./demo-json

# MCP client workflow:
# 1. Read specable://project and specable://schema
# 2. Call create_primitive / link_primitives to extend synthetic graph
# 3. Call validate_graph; read specable://validation/latest
# 4. Read specable://summary/product-state (basic projection)
# 5. Use placeholder prompt for graph completeness review (optional stub)
```

Show iterative refinement: validation finds gap → tool fixes link → validation passes → projection updates.

## Expected result

- Full alpha loop works locally: roots → CRUD → relationships → validate → project
- Validation state exposed as MCP resources
- At least one projection resource traces back to primitives and relationships
- Alpha success criteria from release definition are demonstrable

## User-visible or agent-visible behavior

- `validate_graph` tool returns structured issues (same model as CLI validate)
- Validation resources (`specable://validation/latest`, issues list) reflect last run
- Projection resources summarize desired state without becoming source of truth
- Placeholder prompts orient clients to read resources before recommending writes
- Server remains model-provider neutral (no sampling)

## Acceptance criteria

- [ ] MCP client completes end-to-end demo workflow on synthetic graph
- [ ] Validation tool + validation resources stay consistent after mutations
- [ ] Basic product-state projection readable and traceable to primitive IDs
- [ ] JSON and SQLite roots both supported through same MCP surface
- [ ] No Pathable-hosted infrastructure required
- [ ] All release-level alpha success criteria met or explicitly deferred with documented rationale

## Scope

- Validation tools and validation resources on MCP server
- Basic projection resources (`specable://summary/product-state`, per-primitive or per-workflow summary as minimum)
- Placeholder/orientation prompts (categories defined; named prompts optional)
- End-to-end documentation and quickstart for alpha evaluators
- npm alpha publish readiness (Changesets prerelease) if in release scope

## Out of scope

- Cloud hosting, multi-user, permissions
- Design/engineering primitives
- Sampling, elicitation, notifications
- Full prompt library and autonomous planning loops

## Dependencies

- [MCP server roots, resources, and tools](mcp-server-roots-resources-tools.md)
- [Validate desired product state](validate-desired-product-state.md)
- [MCP-shaped command surface](mcp-shaped-cli-commands.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Complete the **SpecAble alpha MCP server** vertical slice: root-aware server
with CRUD/relationship tools, **validation tools and validation resources**,
and **basic projection resources** over desired product state. Add placeholder
**prompts** for orientation and graph completeness review (prompts guide
workflows; they do not store product truth). Deliver end-to-end local demo and
evaluator quickstart. Server must not embed model execution (no sampling).

### Users / actors

- Pathable engineers and early technical evaluators
- AI clients refining synthetic product graphs locally
- Contributors validating alpha before npm `alpha` dist-tag publish

### Required behavior

- MCP server exposes: project, schema, graph, primitives, relationships,
  validation/latest, validation/issues, summary/product-state (minimum set)
- Tools include validate_graph, inspect_graph_integrity (or equivalent),
  summarize_product_state, plus CRUD/relationship tools from prior milestone
- Validation issues include ID, severity, primitive IDs, rule, explanation,
  suggested next action
- Projections are generated views traceable to primitives/relationships; graph remains source of truth
- Prompts (if exposed) guide resource reads and explicit tool writes only
- Works locally on JSON and SQLite roots
- Document supported MCP clients and connection steps
- Meet release success criteria in docs/releases/alpha.md

### Constraints

- Local-first; low-risk adoption; no Pathable inference billing
- Product primitives only
- Archive vs destructive delete per alpha decision must be consistent across CLI and MCP
- Changeset-worthy public API changes documented for `@specable/cli` publish

### Non-goals

- Hosted SpecAble cloud
- External production adapters
- MCP sampling, elicitation, notifications
- Roadmap/codegen/autonomous orchestration

### Success definition

Independent evaluator follows quickstart, connects MCP client, runs iterative
refinement demo on synthetic graph, and confirms release success criteria checklist.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/7
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/73 (setup)

## Risks or blockers

- Alpha primitive boundary (Decision/Risk/Evidence) may slip to post-alpha if unresolved

## Completion evidence

- [ ] End-to-end demo recorded or documented in quickstart
- [ ] Acceptance criteria and release success criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Alpha publish checklist complete (if shipping npm alpha)
