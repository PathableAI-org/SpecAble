# MCP server roots, resources, and tools

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The MCP server exposes the core protocol surface for a configured project root:
clients discover roots, read product primitive resources, and call tools for
primitive CRUD and relationship management.

## Why this matters

This slice proves SpecAble can present desired product state as an
MCP-accessible semantic storage layer before the full refinement loop,
validation polish, and generated projections land in the final alpha slice.

## Demo

```sh
# Start local MCP server (stdio or configured transport)
specable mcp serve --root ./demo-json

# From MCP client (Cursor, Claude Desktop, or inspector):
# - List roots / select active root
# - Read specable://project, specable://graph, specable://primitives/capabilities
# - Call create_primitive, get_primitive, link_primitives, list_relationships
```

Use synthetic project and primitive data only.

## Expected result

- MCP client connects to local server without Pathable infrastructure
- Resources return semantic JSON matching CLI contract tests
- Tools mutate graph through controlled write operations
- Root selection binds operations to one project graph

## User-visible or agent-visible behavior

- Server advertises roots and core resource templates
- Resource reads are read-only semantic views
- Tools perform CRUD and relationship operations with structured success/error responses
- Write tools preserve graph as source of truth (no silent prose-only mutations)

## Acceptance criteria

- [ ] MCP client can connect and list/read project + graph resources
- [ ] MCP client can create and get a primitive via tools
- [ ] MCP client can link two primitives via relationship tool
- [ ] Operations respect root boundary (no cross-root leakage)
- [ ] Server runs locally with no Pathable-hosted dependencies
- [ ] Demo documented with at least one supported MCP client

## Scope

- MCP server process exposing roots
- Core resources: project context, schema/ontology, graph, primitive collections/details, relationships
- Core tools: primitive CRUD family, relationship link/unlink/list, search (minimal)
- Reuse handlers from MCP-shaped CLI milestone

## Out of scope

- Full validation resource suite and projection resources (final slice)
- Named prompts (categories may be stubbed)
- Sampling, elicitation, notifications
- Hosted/cloud deployment

## Dependencies

- [MCP-shaped command surface](mcp-shaped-cli-commands.md)
- [Create and inspect primitives](create-inspect-primitives.md)
- [Readable semantic wiki](readable-semantic-wiki.md) and wiki-backed semantic graph (milestones 3–4 per [alpha release](../releases/alpha.md); this document reflects prior graph-first sequencing and will be superseded)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Implement a **local MCP server** for SpecAble alpha that exposes **roots**,
**resources**, and **tools** over the MCP protocol. Reuse library handlers from
the MCP-shaped CLI contract. Alpha minimum: one configured JSON or SQLite root;
root-aware resource URIs; tools for primitive CRUD and relationship management;
read resources for project, schema, graph, primitives, and relationships.

### Users / actors

- AI clients (Cursor, Claude Desktop, other MCP hosts)
- Engineers evaluating semantic product state access for agents

### Required behavior

- Server starts locally against configured root(s)
- MCP resources expose semantic desired product state (not raw storage dumps)
- Tools: `create_primitive`, `get_primitive`, `update_primitive`,
  `archive_primitive` (or delete per alpha decision), `list_primitives`,
  `search_primitives`, `link_primitives`, `unlink_primitives`,
  `list_relationships`, `get_related_primitives` (subset acceptable if documented)
- Generic primitive tool family with `primitiveType` parameter unless type-specific tools prove necessary
- Structured errors with codes meaningful to LLM clients
- No embedded model provider; no sampling in alpha core

### Constraints

- Local-first; user supplies MCP client and model access
- Write tools require explicit tool calls (no silent graph mutation via prompts)
- Constitution: thin MCP adapter over tested library packages

### Non-goals

- `validate_graph` and validation resources (may be partial; completed in final slice)
- Projection/summary resources beyond minimal read models
- Multi-user collaboration
- Production external adapters (Notion, GitHub, etc.)

### Success definition

Documented MCP client connects, reads graph resources, creates and links
synthetic primitives, and passes automated integration tests against local server.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/6
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/72 (setup)

## Risks or blockers

- MCP client compatibility matrix may require transport or capability tweaks

## Completion evidence

- [ ] Demo completed with named MCP client
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] MCP integration tests in CI (where feasible without secrets)
