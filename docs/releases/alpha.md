# SpecAble Alpha — Local MCP Server for Desired Product State

**Status:** Draft

This document is the public planning contract for a planned release. When the
release ships, summarize what actually shipped in a
[GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github)
and link back to this definition.

## Release goal

SpecAble Alpha proves that a product's **desired product state** can be
maintained as a structured semantic product primitive graph, exposed to AI
clients through a local MCP server, and refined iteratively through a local CLI
— without Pathable-hosted infrastructure or managed inference costs.

## Release thesis

AI tools can reason more reliably over product intent when that intent is
represented as explicit primitives, relationships, validation outputs, and
semantic resources rather than scattered prose documents.

Alpha should prove:

> A local semantic storage layer can let humans and AI tools iteratively build a
> clearer picture of what a product should become.

This release is not an AI product manager, planning app, or orchestration engine.
It is the first demoable version of the semantic representation layer that
those systems may later consume.

## Target users / usage mode

Alpha is intended for **local use** by Pathable and early technical evaluators.

Expected usage:

- Run a local CLI against a configured SpecAble project root
- Initialize a product primitive graph backed by JSON files or SQLite
- Create, inspect, link, and validate product primitives
- Expose the same graph through a local MCP server to AI clients
- Test semantic graph behavior without Pathable-hosted infrastructure or
  Pathable-managed inference billing

Parent vision: [AI-assisted product-to-design-to-engineering platform](https://app.notion.com/p/3857cbd04b6d81d5b608efc03358db2a) (internal reference; public docs use synthetic examples only).

## Scope

- Product primitive graph (product primitives only)
- Product primitive storage abstraction
- Local JSON and SQLite storage backends
- Project roots as storage-bound project contexts
- Product primitive relationships and CRUD operations
- Iterative refinement of desired product state
- CLI commands that mirror planned MCP resources and tools
- MCP resources for reading semantic product state
- MCP tools for primitive maintenance, validation, search, and graph inspection
- Placeholder prompt workflows for common product-review tasks
- Local-first / low-risk adoption model
- Root-aware MCP resources and tools
- Basic projections over desired product state (traceable to primitives)

Candidate product primitives: Objective, Actor, Persona, Domain Concept,
Capability, Expected Result, Workflow, Story, Product Decision, Product Risk,
Evidence / Source (open question: core primitives vs operating metadata).

## Out of scope

- Design primitives, engineering primitives, roadmap/slice-planning primitives
- Hosted cloud platform, multi-user collaboration, permissions, org governance
- AI orchestration engine, autonomous agent planning loops, code generation
- Full write automation across external tools
- Notion, Confluence, Jira, Linear, GitHub, or Figma **production** adapters
- MCP sampling (model execution owned by client/host, not SpecAble)
- MCP notifications (deferred unless required for client compatibility)
- MCP elicitation flows (deferred; validation issues + prompts suffice for alpha)

## Success criteria

- [ ] A user can initialize JSON-backed and SQLite-backed project roots with the same semantic graph contract
- [ ] A user can create, inspect, update, and archive product primitives through the CLI
- [ ] A user can link and unlink primitives through typed relationships
- [ ] A user can run validation and receive structured issues guiding desired-state refinement
- [ ] CLI output is usable by humans and AI tools
- [ ] The MCP server exposes root-aware semantic resources (project, schema, graph, primitives, relationships, validation, projections)
- [ ] The MCP server exposes root-aware tools for primitive CRUD, relationship management, validation, and summarization
- [ ] The MCP server can validate the graph and expose validation state as resources
- [ ] At least one basic projection of desired product state is available via MCP
- [ ] Alpha runs fully locally without Pathable-hosted infrastructure

## Vertical slice milestone list

Ordered by demoable product capability, not internal architecture:

1. **[Initialize JSON and SQLite project roots](docs/milestones/initialize-project-roots.md)** — CLI initializes and inspects local SpecAble project roots for JSON and SQLite backends
2. **[Create and inspect primitives](docs/milestones/create-inspect-primitives.md)** — CLI creates product primitives and reads them back as structured graph data from a configured root
3. **[Link primitives into a graph](docs/milestones/link-primitive-graph.md)** — CLI creates typed relationships and shows resulting semantic graph structure
4. **[Validate desired product state](docs/milestones/validate-desired-product-state.md)** — CLI runs validation rules and returns structured issues for missing or inconsistent desired-state information
5. **[MCP-shaped command surface](docs/milestones/mcp-shaped-cli-commands.md)** — CLI commands mirror planned MCP resources and tools for contract testing before protocol integration
6. **[MCP server roots, resources, and tools](docs/milestones/mcp-server-roots-resources-tools.md)** — MCP clients discover roots, read semantic resources, and call CRUD/relationship tools
7. **[Local MCP server for desired product state](docs/milestones/local-mcp-desired-product-state.md)** — End-to-end alpha: MCP server validates graph integrity and exposes basic projections over desired product state

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope creep into cloud, design, or engineering primitives | Explicit out-of-scope list; constitution and release gates |
| Storage adapter divergence breaks semantic contract | Shared graph contract tests across JSON and SQLite backends |
| MCP surface too large for alpha | Ordered vertical slices; CLI as test harness before full MCP |
| Product Decision / Risk / Evidence primitive boundary unclear | Document open question; default to core graph types first |
| Overlap with v0 read-only `specable check` | v0 proves validation on fixtures; alpha adds persistence, CRUD, and MCP |

## Open questions

- Minimum canonical schema for each primitive type in alpha
- Whether Product Decision, Product Risk, and Evidence are core primitives or metadata
- Destructive delete vs archive/deactivate for write tools
- Mandatory relationship types for alpha
- Resource URI scheme and whether root IDs appear in resource URIs
- Generic vs type-specific MCP CRUD tool families
- Named MCP prompts in alpha vs prompt categories only
- Which MCP clients to use for first compatibility testing

## Links

- Parent vision (internal): Notion — AI-assisted product-to-design-to-engineering platform
- Prior release: [docs/releases/v0.md](v0.md)
- GitHub Milestones:
  - [Alpha 1: Initialize JSON and SQLite project roots](https://github.com/PathableAI-org/SpecAble/milestone/1)
  - [Alpha 2: Create and inspect primitives](https://github.com/PathableAI-org/SpecAble/milestone/2)
  - [Alpha 3: Link primitives into a graph](https://github.com/PathableAI-org/SpecAble/milestone/3)
  - [Alpha 4: Validate desired product state](https://github.com/PathableAI-org/SpecAble/milestone/4)
  - [Alpha 5: MCP-shaped command surface](https://github.com/PathableAI-org/SpecAble/milestone/5)
  - [Alpha 6: MCP server roots, resources, and tools](https://github.com/PathableAI-org/SpecAble/milestone/6)
  - [Alpha 7: Local MCP server for desired product state](https://github.com/PathableAI-org/SpecAble/milestone/7)
- Related issues: setup issues [#17](https://github.com/PathableAI-org/SpecAble/issues/17), [#68](https://github.com/PathableAI-org/SpecAble/issues/68)–[#73](https://github.com/PathableAI-org/SpecAble/issues/73)
- GitHub Release (when shipped): TBD
