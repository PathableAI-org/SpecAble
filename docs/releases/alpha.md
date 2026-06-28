# SpecAble Alpha — Structured Semantic Product Wiki

**Status:** Draft

This document is the public planning contract for a planned release. When the
release ships, summarize what actually shipped in a
[GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github)
and link back to this definition.

## Release goal

SpecAble Alpha proves that a vague product idea can be captured as a **structured,
human-readable semantic wiki**, validated for completeness, projected into a
high-quality PRD, and exposed to AI agents through a local MCP adapter — without
Pathable-hosted infrastructure or managed inference costs.

The semantic wiki is the primary editable representation of product knowledge.
The product primitive graph is the semantic interpretation of that wiki, not a
separately authored artifact. JSON, SQLite, Markdown, Org, and MCP are adapters
over the same domain model rather than competing sources of truth.

## Release thesis

Product intent scattered across prose documents degrades quickly. AI tools can
reason more reliably over product intent when that intent is represented with
formal semantics — typed concepts, relationships, metadata, stable identifiers,
provenance, and validation — in a form humans can read and edit directly.

Alpha should prove:

> A vague product idea can be captured as a structured semantic wiki, validated
> for completeness, projected into a high-quality PRD, and exposed through MCP
> for agent consumption.

This release is not an AI product manager, planning app, or orchestration engine.
It is the first demoable version of the semantic representation layer that those
systems may later consume.

### How the wiki architecture strengthens core principles

The alpha direction refines — rather than replaces — the project's existing
principles:

- **Local-first:** Wiki pages and derived graph state live in the user's project
  root; validation and PRD projection run offline on the same semantic model.
- **Tool-agnostic:** Markdown, Org, Notion, Confluence, JSON, and SQLite are
  interchangeable storage and presentation adapters; core semantics stay in the
  primitive ontology.
- **Explicit product knowledge:** Wiki pages encode typed primitives and
  relationships with stable IDs instead of unstructured prose alone.
- **Traceability:** Projections such as PRDs cite primitive provenance; edits in
  the wiki remain the durable source of meaning.
- **Derivation over duplication:** The graph, validation findings, PRD output,
  and MCP resources are derived from wiki-backed knowledge rather than
  maintained as parallel artifacts.
- **Small coherent ontology:** The wiki is a human-readable storage form for the
  existing product primitives — Objective, Actor, Persona, Domain Concept,
  Capability, Expected Result, Decision, Risk, Evidence, and related
  relationships — not a separate wiki-specific primitive layer.

## Architectural direction

Early alpha planning centered on a local MCP server backed by JSON/SQLite graph
storage. Milestones 1 and 2 delivered that foundation: configurable project
roots and primitive create/inspect over storage adapters.

Subsequent planning sharpened the model:

- SpecAble is a system for maintaining a structured, human-readable **product
  knowledge wiki**.
- Knowledge uses formal semantics while remaining editable in readable formats
  (Markdown, Org, and similar).
- External tools — including MCP clients — are **adapters** over the semantic
  model, not the source of the model.
- The graph is the **semantic interpretation** of the wiki, derived from wiki
  content rather than requiring authors to maintain a parallel graph artifact.

JSON and SQLite backends established in milestones 1 and 2 remain useful as
storage adapters and proving tools. The stronger alpha direction is readable
semantic wiki pages as the primary authoring experience.

## Target users / usage mode

Alpha is intended for **local use** by Pathable and early technical evaluators.

Expected usage:

- Run a local CLI against a configured SpecAble project root
- Capture and refine product knowledge as readable semantic wiki pages
- Inspect the derived primitive graph, relationships, and validation state
- Project wiki-backed knowledge into a PRD or similar summary artifact
- Expose the same semantic model through a local MCP server to AI clients
- Test semantic wiki behavior without Pathable-hosted infrastructure or
  Pathable-managed inference billing

Parent vision: [AI-assisted product-to-design-to-engineering platform](https://app.notion.com/p/3857cbd04b6d81d5b608efc03358db2a) (internal reference; public docs use synthetic examples only).

## Scope

- Structured semantic product wiki (human-readable pages backed by formal semantics)
- Product primitive graph derived from wiki content
- Product primitive storage abstraction with adapter implementations
- Local JSON and SQLite storage adapters (from completed foundation work)
- Readable wiki storage adapter (Markdown or equivalent for alpha)
- Project roots as storage-bound project contexts
- Product primitive relationships inferred or authored through wiki structure
- Validation of product understanding and PRD readiness
- PRD projection traceable to wiki-backed primitives
- CLI commands for wiki maintenance, graph inspection, validation, and projection
- MCP adapter exposing wiki-backed semantic resources and maintenance tools
- Placeholder prompt workflows for common product-review tasks
- Local-first / low-risk adoption model
- Basic projections over product knowledge (PRD as primary alpha projection)

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

- [x] A user can initialize JSON-backed and SQLite-backed project roots with the same semantic graph contract *(milestone 1)*
- [x] A user can create, inspect, update, and archive product primitives through the CLI *(milestone 2)*
- [ ] A user can author and edit product knowledge as readable semantic wiki pages in a local project root
- [ ] Wiki content round-trips through storage without losing typed primitive semantics or stable identifiers
- [ ] A semantic graph is derived from wiki-backed knowledge with typed relationships
- [ ] A user can run validation and receive structured issues guiding product-understanding refinement and PRD readiness
- [ ] CLI output is usable by humans and AI tools
- [ ] A user can project wiki-backed product knowledge into a high-quality, traceable PRD (or equivalent summary artifact)
- [ ] The MCP server exposes root-aware semantic resources over the wiki-backed model (project, schema, graph, primitives, relationships, validation, projections)
- [ ] The MCP server exposes root-aware tools for wiki/graph maintenance, validation, search, and summarization
- [ ] Alpha runs fully locally without Pathable-hosted infrastructure

## Vertical slice milestone list

Ordered by demoable product capability, not internal architecture.

**Completed foundation (unchanged):**

1. **[Initialize JSON and SQLite project roots](docs/milestones/initialize-project-roots.md)** — ✅ Complete. CLI initializes and inspects local SpecAble project roots for JSON and SQLite backends.
2. **[Create and inspect primitives](docs/milestones/create-inspect-primitives.md)** — ✅ Complete. CLI creates product primitives and reads them back as structured graph data from a configured root.

**Remaining work (revised scope):**

Milestone documents for slices 3–7 will be revised to match this roadmap
([#90](https://github.com/PathableAI-org/SpecAble/issues/90)). Until those
documents are updated, this release definition is authoritative for their intent.

3. **Readable semantic wiki storage** — CLI reads and writes human-readable wiki pages that encode typed product primitives with stable identifiers and provenance
4. **Wiki-backed semantic graph** — CLI derives typed primitive relationships from wiki structure and exposes the resulting graph for inspection
5. **PRD readiness validation** — CLI runs validation rules over wiki-backed knowledge and returns structured issues for missing or inconsistent product understanding
6. **PRD projection** — CLI projects validated wiki-backed knowledge into a high-quality, traceable PRD (or equivalent summary artifact)
7. **MCP adapter for structured product wiki** — End-to-end alpha: MCP server exposes wiki-backed semantic resources and tools for agent consumption, including validation state and PRD projection

Prior milestone documents for slices 3–7
([link-primitive-graph](docs/milestones/link-primitive-graph.md),
[validate-desired-product-state](docs/milestones/validate-desired-product-state.md),
[mcp-shaped-cli-commands](docs/milestones/mcp-shaped-cli-commands.md),
[mcp-server-roots-resources-tools](docs/milestones/mcp-server-roots-resources-tools.md),
[local-mcp-desired-product-state](docs/milestones/local-mcp-desired-product-state.md))
reflect the earlier graph-first sequencing and will be superseded.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope creep into cloud, design, or engineering primitives | Explicit out-of-scope list; constitution and release gates |
| Wiki syntax diverges from domain semantics | Shared decode/round-trip tests; wiki pages map to existing primitive schemas |
| Storage adapter divergence breaks semantic contract | Shared graph contract tests across JSON, SQLite, and wiki backends |
| MCP surface too large for alpha | MCP as final adapter slice; CLI as test harness before full protocol integration |
| Product Decision / Risk / Evidence primitive boundary unclear | Document open question; default to core graph types first |
| Overlap with v0 read-only `specable check` | v0 proves validation on fixtures; alpha adds persistence, wiki authoring, and agent access |

## Open questions

- Minimum canonical schema for each primitive type in alpha
- Wiki page format and authoring conventions (Markdown front matter, Org properties, etc.)
- Whether Product Decision, Product Risk, and Evidence are core primitives or metadata
- Destructive delete vs archive/deactivate for write tools
- Mandatory relationship types for alpha
- Resource URI scheme and whether root IDs appear in resource URIs
- Generic vs type-specific MCP CRUD tool families
- Named MCP prompts in alpha vs prompt categories only
- Which MCP clients to use for first compatibility testing
- PRD projection template and minimum sections for alpha

## Links

- Parent vision (internal): Notion — AI-assisted product-to-design-to-engineering platform
- Prior release: [docs/releases/v0.md](v0.md)
- Architecture pivot: [#90](https://github.com/PathableAI-org/SpecAble/issues/90)
- GitHub Milestones:
  - [Alpha 1: Initialize JSON and SQLite project roots](https://github.com/PathableAI-org/SpecAble/milestone/1) — complete
  - [Alpha 2: Create and inspect primitives](https://github.com/PathableAI-org/SpecAble/milestone/2) — complete
  - Alpha 3–7: titles and milestone documents to be revised per [#90](https://github.com/PathableAI-org/SpecAble/issues/90)
- Related issues: setup issues [#17](https://github.com/PathableAI-org/SpecAble/issues/17), [#68](https://github.com/PathableAI-org/SpecAble/issues/68)–[#73](https://github.com/PathableAI-org/SpecAble/issues/73)
- GitHub Release (when shipped): TBD
