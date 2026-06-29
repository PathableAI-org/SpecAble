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
separately authored artifact. JSON, SQLite, Markdown, and Org are storage and
presentation adapters over the same domain model; MCP is a protocol adapter that
exposes that model to AI clients — none of them are competing sources of truth.

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
- Expose the same semantic model through an MCP adapter to AI clients
- Test semantic wiki behavior without Pathable-hosted infrastructure or
  Pathable-managed inference billing

Parent vision: [AI-assisted product-to-design-to-engineering platform](https://app.notion.com/p/3857cbd04b6d81d5b608efc03358db2a) (internal reference; public docs use synthetic examples only).

## Scope

- Structured semantic product wiki (human-readable pages backed by formal semantics)
- Product knowledge model derived from wiki content through semantic interpretation
- Product primitive storage abstraction with adapter implementations
- Local JSON and SQLite storage adapters (from completed foundation work)
- Readable wiki storage adapter (Markdown or equivalent for alpha)
- Project roots as storage-bound project contexts
- Product primitive relationships inferred or authored through wiki structure
- Validation of product understanding and PRD readiness
- PRD projection traceable to wiki-backed primitives
- CLI commands for wiki maintenance, graph inspection, validation, and projection
- MCP adapter exposing wiki-backed semantic product knowledge to agents — interpreted concepts, relationships, provenance, validation findings, and derived artifacts such as the PRD
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
- [x] A user can create, list, and inspect product primitives through the CLI *(milestone 2)*
- [ ] The semantic document model is defined: metadata vs body, relationships, stable identity, and provenance — adapter-agnostic and grounded in existing product primitives *(milestone 3)*
- [ ] A user can author and edit product knowledge as readable semantic documents in a local project root
- [ ] Semantic documents round-trip through storage without losing typed primitive semantics or stable identifiers
- [ ] Semantic documents are interpreted into a coherent product knowledge model with explicit typed relationships and traceable provenance *(milestone 4)*
- [ ] A user can evaluate interpreted product knowledge for PRD readiness and receive structured findings that guide wiki refinement — not merely document parse failures *(milestone 5)*
- [ ] CLI output is usable by humans and AI tools
- [ ] A user can project wiki-backed product knowledge into a high-quality, traceable PRD (or equivalent summary artifact)
- [ ] The MCP adapter exposes semantic product knowledge to agents over the same wiki-backed model humans use — interpreted concepts, relationships, provenance, validation findings, and derived artifacts such as the PRD *(milestone 7)*
- [ ] Agents consuming through the MCP adapter remain grounded in the same explicit product understanding as human collaborators — no parallel source of truth
- [ ] Alpha runs fully locally without Pathable-hosted infrastructure

## Vertical slice milestone list

Ordered by demoable product capability, not internal architecture.

**Completed foundation (unchanged):**

1. **[Initialize JSON and SQLite project roots](../milestones/alpha/001-initialize-project-roots.md)** — ✅ Complete. CLI initializes and inspects local SpecAble project roots for JSON and SQLite backends.
2. **[Create and inspect primitives](../milestones/alpha/002-create-inspect-primitives.md)** — ✅ Complete. CLI creates, lists, and inspects product primitives as structured graph data from a configured root.

**Remaining work (revised scope):**

Slice 7 is defined in [#95](https://github.com/PathableAI-org/SpecAble/issues/95).

3. **[Readable semantic wiki](../milestones/alpha/003-readable-semantic-wiki.md)** — define the semantic document model: human-readable product knowledge with formal structure, stable identity, typed relationships, and provenance; adapter-agnostic contract before format or parser choices
4. **[Semantic interpretation layer](../milestones/alpha/004-semantic-interpretation-layer.md)** — define how SpecAble understands semantic documents: interpreted concepts, explicit relationships, provenance, gaps, and derivable views; adapter-agnostic contract before parser or storage choices
5. **[PRD readiness validation](../milestones/alpha/005-validate-desired-product-state.md)** — define validation as reasoning over interpreted product knowledge: completeness, coherence, uncertainty, and traceability for PRD projection readiness; adapter-agnostic contract before rule engine or CLI choices
6. **[PRD projection](../milestones/alpha/006-prd-projection.md)** — define how SpecAble derives a coherent, traceable PRD from validated interpreted product knowledge; adapter-agnostic contract before generator, CLI, or rendering choices
7. **[MCP adapter](../milestones/alpha/007-mcp-adapter.md)** — define how SpecAble exposes semantic product knowledge to AI agents: same wiki-backed model as humans, including relationships, provenance, validation findings, and derived artifacts; adapter-agnostic contract before protocol, transport, or server choices

Prior graph-first MCP milestone documents
(mcp-shaped-cli-commands.md,
mcp-server-roots-resources-tools.md,
local-mcp-desired-product-state.md)
are superseded by [mcp-adapter.md](../milestones/alpha/007-mcp-adapter.md)
([#95](https://github.com/PathableAI-org/SpecAble/issues/95)). The former
slice 3 document (link-primitive-graph.md)
is superseded by
[readable-semantic-wiki](../milestones/alpha/003-readable-semantic-wiki.md)
([#91](https://github.com/PathableAI-org/SpecAble/issues/91)).

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
- Concrete wiki serialization and authoring conventions (deferred to Spec Kit plan phase after semantic document model is ratified — see [readable-semantic-wiki](../milestones/alpha/003-readable-semantic-wiki.md))
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
  - [Alpha 3: Readable semantic wiki](https://github.com/PathableAI-org/SpecAble/milestone/3) — semantic document model ([#91](https://github.com/PathableAI-org/SpecAble/issues/91))
  - [Alpha 4: Semantic interpretation layer](https://github.com/PathableAI-org/SpecAble/milestone/4) — wiki-to-model interpretation contract ([#92](https://github.com/PathableAI-org/SpecAble/issues/92))
  - [Alpha 5: PRD readiness validation](https://github.com/PathableAI-org/SpecAble/milestone/5) — [validate-desired-product-state.md](../milestones/alpha/005-validate-desired-product-state.md) ([#93](https://github.com/PathableAI-org/SpecAble/issues/93); title and description to be updated after merge)
  - [Alpha 6: PRD projection](https://github.com/PathableAI-org/SpecAble/milestone/6) — [prd-projection.md](../milestones/alpha/006-prd-projection.md) ([#94](https://github.com/PathableAI-org/SpecAble/issues/94))
  - [Alpha 7: MCP adapter](https://github.com/PathableAI-org/SpecAble/milestone/7) — [mcp-adapter.md](../milestones/alpha/007-mcp-adapter.md) ([#95](https://github.com/PathableAI-org/SpecAble/issues/95))
- Related issues: setup issues [#17](https://github.com/PathableAI-org/SpecAble/issues/17), [#68](https://github.com/PathableAI-org/SpecAble/issues/68)–[#73](https://github.com/PathableAI-org/SpecAble/issues/73)
- GitHub Release (when shipped): TBD
