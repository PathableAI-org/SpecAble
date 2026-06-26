# MCP-shaped command surface

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

## Goal

The CLI exposes commands that correspond closely to planned MCP resources and
tools, letting the team test roots, graph reads, primitive operations,
relationship operations, validation, and output/error shapes before MCP protocol
integration.

## Why this matters

The CLI becomes the test harness for the alpha MCP server contract. Stable
shapes here reduce rework when wiring the MCP SDK.

## Demo

```sh
# Commands mirror planned MCP operations (names illustrative; align to implementation)
specable mcp roots list
specable mcp resources read specable://project --root ./demo-json
specable mcp resources read specable://graph/summary --root ./demo-json
specable mcp tools call create_primitive --root ./demo-json --args '{...}'
specable mcp tools call validate_graph --root ./demo-json
```

Show JSON payloads matching planned MCP resource/tool response schemas.

## Expected result

- CLI subcommands (or `mcp` namespace) exercise the same operations the MCP server will expose
- Resource read and tool call results match documented alpha contract shapes
- Errors mirror MCP-friendly structured error responses

## User-visible or agent-visible behavior

- List configured roots / project contexts
- Read resource URIs within a root (project, schema, graph summary, primitive collections)
- Invoke tool operations via CLI with same parameters MCP clients will use
- Output JSON suitable for diffing in tests and agent consumption

## Acceptance criteria

- [ ] CLI can read at least project, graph summary, and primitive collection resource shapes
- [ ] CLI can invoke create/get/list primitive and link/validate tool shapes
- [ ] Responses documented and stable enough for contract tests
- [ ] Root context required on every operation (no ambiguous global state)
- [ ] Synthetic root used in demo

## Scope

- CLI `mcp` (or equivalent) namespace mirroring MCP resources and tools
- Shared handlers used by both CLI test harness and future MCP server
- Contract documentation for alpha resource URI patterns and tool names

## Out of scope

- Actual MCP protocol transport (stdio/SSE) — next milestone
- Full resource catalog (subset matching prior slices is OK)
- MCP prompts registration

## Dependencies

- [Validate desired product state](validate-desired-product-state.md)
- Prior primitive, relationship, and root milestones

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Add a CLI **MCP-shaped command surface** that invokes the same handlers planned
for the alpha MCP server: root listing, resource reads (`specable://project`,
`specable://schema`, `specable://graph`, primitive collections/details,
validation latest), and tool calls (primitive CRUD, relationship link/unlink,
`validate_graph`, `summarize_product_state`). CLI output must match MCP response
DTOs so the team can contract-test before protocol wiring.

### Users / actors

- SpecAble developers implementing MCP server against proven contracts
- Technical evaluators scripting alpha behavior without an MCP client

### Required behavior

- Every operation is root-scoped
- Resource read returns semantic model views, not raw storage files
- Tool call accepts JSON arguments and returns structured results/errors
- Validate and summarize tools return structured data, not prose-only
- Handlers live in library layer; CLI is thin adapter (constitution V)
- Document alpha URI patterns and tool names in repo contracts

### Constraints

- Read resources expose desired product state; tools mutate or compute
- No MCP sampling or notifications
- Synthetic roots in tests and demos

### Non-goals

- MCP SDK server process
- Full prompt catalog
- External storage adapters

### Success definition

Contract tests run resource reads and tool calls via CLI and match golden JSON
fixtures; handlers are importable by MCP server milestone without duplication.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: TBD
- Spec Kit spec: TBD
- Issues: TBD

## Risks or blockers

- URI scheme and root-in-URI vs active-root context must be decided before freeze

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] Contract test suite for CLI MCP-shaped commands
