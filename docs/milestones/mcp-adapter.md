# MCP adapter

**Release:** [docs/releases/alpha.md](../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Establish the **MCP adapter** — the conceptual contract for how SpecAble exposes
semantic product knowledge to AI agents through an integration layer. By the end
of this milestone, SpecAble has a clear definition of MCP as an **adapter over the
semantic product model**, not as the product itself: agents consume the same
explicit knowledge humans work with — semantic documents, interpreted concepts,
relationships, provenance, validation findings, and derived artifacts such as the
PRD — without introducing a competing source of truth or a parallel product
representation.

This slice completes the alpha architecture by connecting human-editable semantic
documents through interpretation, validation, and projection to agent consumption
over a single coherent semantic model.

## Why this matters

Milestones 3–6 established what authors write (semantic documents), what SpecAble
understands (interpreted product knowledge), whether that understanding is
sufficient (PRD readiness validation), and how validated knowledge projects into
a traceable PRD. Alpha’s thesis depends on the final step: **agents must be able
to reason over the same product knowledge humans maintain** — grounded in the wiki,
not in adapter-invented summaries or protocol-specific shapes that drift from the
ontology.

Without a defined MCP adapter contract, later work risks treating the MCP server
as the product, inventing agent-only knowledge representations, or exposing raw
storage details instead of normalized semantic views. The adapter contract keeps
MCP as an **integration layer** that exposes knowledge SpecAble already holds —
it does not create, redefine, or duplicate product meaning.

## MCP adapter model

The following is the **conceptual contract** this milestone ratifies. Later
milestones implement protocol wiring, transport, CLI test harnesses, and concrete
resource and tool surfaces against this model. No MCP protocol details, transport
mechanisms, resource URI schemes, tool catalogs, API schemas, authentication, or
server implementation are prescribed here.

### Adapter boundary

The **MCP adapter** is the act of exposing SpecAble’s semantic product knowledge
to MCP-compatible agent clients — making the same interpreted, validated, and
projected understanding available to agents that humans access through semantic
documents, CLI inspection, and derived artifacts.

```text
Human-editable semantic documents (wiki)          ← source of truth
        │
        ▼  interpret
Semantic product knowledge model
        │
        ▼  validate (PRD readiness)
Validation assessment
        │
        ▼  project
Derived artifacts (PRD, summaries, …)
        │
        ▼  expose
MCP adapter  →  agent consumption                 ← integration layer
```

- **Input to exposure:** semantic product knowledge model, validation assessment,
  and derived artifacts produced by milestones 3–6 — not raw storage files or
  adapter-specific caches.
- **Output to agents:** access to the same explicit product knowledge humans rely
  on — inspectable, traceable, and grounded in the wiki-backed semantic model.
- **Non-goal:** the adapter does not author product knowledge, interpret documents,
  validate readiness, or project PRDs; it **exposes** what SpecAble already derived.

### MCP exposes knowledge; it does not create knowledge

The MCP adapter **exposes** semantic product knowledge. It **does not create**
product meaning.

Agents consuming through the adapter MUST receive knowledge that:

- originates from **semantic documents** as the sole editable source of truth;
- flows through **interpretation** into typed concepts and relationships;
- includes **validation findings** that explain readiness gaps and uncertainty;
- includes **derived artifacts** (such as the PRD) as read-only projections with
  traceability back to semantic concepts;
- preserves **provenance** so agent reasoning can be grounded and audited.

The adapter MUST NOT:

- introduce a parallel product-knowledge representation agents treat as canonical;
- accept generated prose (including PRD text) as authoritative product state;
- silently mutate semantic documents from agent-suggested or projected narrative;
- redefine ontology primitives, relationship types, or validation rules at the
  protocol boundary;
- become part of the product primitive model or a new source of truth.

**Future write semantics (deferred):** later implementation milestones MAY define
explicit write operations that propose or apply changes only by updating semantic
documents through normal authoring boundaries. This milestone does not define
agent mutation semantics; it establishes that the adapter exposes knowledge and
does not create it.

### What the adapter exposes

Conceptually, the MCP adapter makes the following **categories of knowledge**
available to agents over the same semantic foundation humans use:

| Knowledge category | Agent can inspect | Grounding |
| --- | --- | --- |
| **Project and wiki context** | Which product root, authoring surface, and semantic scope apply | Project configuration and semantic document collection |
| **Ontology and schema** | Which primitive types, statuses, and relationship semantics apply | `@specable/domain` — unchanged by MCP |
| **Interpreted product knowledge** | Typed concepts recovered from semantic documents | Milestone 4 interpretation model |
| **Relationships** | Explicit typed edges between concepts | Interpreted model, not inferred-only prose |
| **Provenance** | Source documents, evidence links, and traceability signals | Milestone 3 and 4 contracts |
| **Validation findings** | PRD readiness posture, gaps, blocking and advisory findings | Milestone 5 validation assessment |
| **Derived artifacts** | PRD and other projections as read-only views | Milestone 6 projection contract |

Exposure is **semantic**, not storage-shaped. Agents see normalized product
knowledge — not raw JSON files, database rows, or wiki syntax unless that syntax
is itself the human-facing semantic document representation.

### Same model for humans and agents

Humans and agents MUST operate over **one coherent semantic model**:

- humans **edit** semantic documents;
- SpecAble **interprets, validates, and projects** from those documents;
- agents **inspect** through the adapter using the same derived understanding —
  not a simplified or agent-only graph.

When a human reviews interpreted concepts, validation findings, or a projected PRD,
and an agent inspects the same knowledge through the adapter, both MUST be
grounded in identical primitive identities, relationships, and provenance. The
adapter is a **view mechanism**, not a second product brain.

### Integration layer, not ontology

MCP is an **integration layer** for agent clients. It is **not** part of SpecAble’s
product ontology.

- Protocol concerns (resources, tools, prompts, transport) belong to adapter
  implementation milestones — not to domain modeling.
- The semantic product model remains authoritative whether accessed via CLI,
  Markdown wiki, JSON storage, SQLite, or MCP.
- Deleting or disabling the MCP adapter MUST NOT change what product knowledge
  means — only how agents reach it.

### Relationship to earlier milestones

The MCP adapter **consumes** the full alpha knowledge chain; it does not replace
any prior milestone.

| Prior milestone | Adapter exposes |
| --- | --- |
| Semantic document model (3) | Authored semantic nodes, metadata, body, identity, provenance |
| Semantic interpretation layer (4) | Interpreted concepts, relationships, gaps, derivable views |
| PRD readiness validation (5) | Readiness posture, findings, preserved uncertainty |
| PRD projection (6) | Derived PRD and traceability metadata as read-only artifact |

The adapter completes alpha by demonstrating:

```text
human-editable semantic documents
        → semantic interpretation
        → product understanding validation
        → derived artifacts
        → agent consumption
```

all over a **single coherent semantic model**.

## What the adapter answers

After completing milestones 3–6, an agent connected through the MCP adapter MUST
be able to determine:

| Question | Adapter exposure |
| --- | --- |
| What product knowledge exists? | Interpreted concepts from semantic documents |
| How do concepts relate? | Typed relationships from the interpreted model |
| Where did this knowledge come from? | Provenance and source document linkage |
| Is the product understanding sufficient? | Validation assessment and readiness posture |
| What gaps remain? | Validation findings and interpretation gaps |
| What does the current PRD say? | Derived PRD projection with traceability |
| Is this the source of truth? | No — semantic documents are; adapter surfaces derived views |

This milestone defines **what MCP means architecturally**. It does not implement
servers, protocol handlers, or client integrations.

## Architectural placement

```text
Milestone 3: semantic document model (what authors write)
        │
        ▼
Milestone 4: semantic interpretation layer (what SpecAble understands)
        │
        ▼
Milestone 5: PRD readiness validation (whether understanding is sufficient)
        │
        ▼
Milestone 6: PRD projection (first major human-readable derived artifact)
        │
        ▼
Milestone 7: MCP adapter (agent consumption over the same semantic model)  ← this milestone
```

- **Wiki** — canonical editable representation; humans edit semantic documents.
- **Interpretation, validation, projection** — SpecAble derives understanding and
  artifacts from the wiki.
- **MCP adapter** — exposes that understanding to agents; does not redefine it.
- **Alpha complete** — one semantic model from authoring through agent consumption.

## Demo

Conceptual walkthrough with **synthetic** product knowledge only:

1. Start from a project root containing semantic documents that have been
   interpreted, validated, and projected per milestones 3–6 — illustrated as
   interpreted concepts, relationships, validation findings, and a derived PRD,
   not executed through an MCP server.
2. Walk through **agent inspection** of the same semantic product knowledge a human
   collaborator would review: concepts, relationships, provenance, validation
   posture, and PRD projection.
3. Show that **validation findings** visible to an agent match what a human sees
   when evaluating PRD readiness — same findings, same severity, same traceability
   to concepts.
4. Show that the **PRD projection** exposed to an agent includes traceability
   metadata and is treated as read-only derived output — not editable canonical
   state.
5. Present a case where an agent **must not** introduce product facts absent from
   semantic documents — the resolution path is wiki refinement, not adapter-side
   invention.
6. Confirm the adapter **does not expose** raw storage dumps as the primary
   product view; agents receive normalized semantic knowledge.
7. Confirm the end-to-end alpha story:

```text
readable semantic wiki → interpretation → validation → PRD projection → agent access
```

This demo ratifies the conceptual adapter contract. Protocol servers, transport
configuration, resource URI design, and automated integration tests belong in
later milestones.

## Expected result

- The MCP adapter is documented and ratified as the alpha contract for agent
  consumption over the semantic product model.
- Exposure boundaries, same-model grounding, and non-authoritative adapter status
  are defined without protocol or implementation prescriptions.
- Reviewers agree the model is sufficient for later implementation milestones to
  wire MCP resources and tools — without revisiting ontology boundaries, inventing
  agent-only knowledge stores, or treating MCP as the product.
- The milestone clearly completes the alpha architecture: one semantic model from
  human authoring through agent consumption.

## User-visible or agent-visible behavior

- Agents **inspect semantic product knowledge** — interpreted concepts,
  relationships, and provenance — grounded in the same wiki-backed model humans use.
- Agents **inspect validation findings** — readiness posture, gaps, and uncertainty
  — to guide wiki refinement rather than inventing missing understanding.
- Agents **consume derived artifacts** such as the PRD as read-only projections
  with traceability; they do not treat generated narrative as authoritative product
  state.
- Agents remain **grounded in the same product understanding** as human
  collaborators — identical primitive identities and relationship semantics.
- **Product knowledge changes** only through semantic document edits — not through
  adapter-side prose ingestion or projection edits.
- Disabling MCP does not change product meaning; it only removes one access path.

## Acceptance criteria

- [ ] The MCP adapter model answers: what the adapter exposes and does not expose;
  why MCP is an integration layer rather than the product or ontology; how agents
  consume the same explicit knowledge as humans; how validation findings and derived
  artifacts are accessible; and why the adapter does not create product knowledge.
- [ ] The **semantic product model is available to MCP-compatible agents** — as a
  defined exposure contract, not an implemented server.
- [ ] Agents **consume the same explicit knowledge as humans** — interpreted
  concepts, relationships, and provenance from wiki-backed semantic documents.
- [ ] **Validation results and derived artifacts** (including PRD projection) are
  accessible through the adapter contract as normalized semantic views.
- [ ] **No new source of truth** has been introduced; semantic documents remain
  canonical and the adapter does not maintain parallel product state.
- [ ] **MCP remains an integration layer** rather than part of the ontology — protocol
  concerns are separated from domain modeling.
- [ ] **Contract examples or acceptance fixtures** illustrate agent-visible exposure
  over the same semantic product knowledge model, validation assessment, and
  projection from at least two representation perspectives (for example,
  human-readable documents plus structured-storage adapter path).
- [ ] No MCP protocol details, transport mechanisms, resource URI schemes, tool
  catalogs, API schemas, authentication, or server implementation are required or
  implied by the milestone contract.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- MCP adapter definition and alpha contract
- Adapter boundary between semantic product knowledge and agent consumption
- Exposure categories: interpreted knowledge, relationships, provenance, validation
  findings, derived artifacts
- Same-model grounding for humans and agents
- Exposure-over-creation principle (write semantics deferred to implementation milestones)
- MCP as integration layer, not ontology or source of truth
- Relationship to milestones 3–6 and completion of the alpha architecture chain
- Contract examples or acceptance fixtures showing adapter-agnostic exposure parity
- Documentation preparing later implementation milestones to wire protocol surfaces

## Out of scope

- MCP protocol specification, SDK integration, or transport (stdio, SSE, etc.)
- Resource URI schemes, resource templates, or resource catalog enumeration
- Tool names, tool parameter schemas, or tool family design
- API schemas, DTO shapes, or serialization formats for protocol messages
- Authentication, authorization, and multi-tenant access control
- MCP server process implementation, hosting, or deployment
- MCP sampling, notifications, and elicitation flows
- CLI `specable mcp` command implementation or MCP-shaped test harness
- Prompt libraries, autonomous orchestration, or agent planning loops
- Design primitives, engineering primitives, release slicing, or implementation
  planning generation
- Introducing new ontology primitives or expanding the product primitive model
- Notion, Confluence, Jira, or other external production adapters
- Cloud hosting, multi-user collaboration, and permissions

## Dependencies

- [Readable semantic wiki](readable-semantic-wiki.md)
- [Semantic interpretation layer](semantic-interpretation-layer.md)
- [PRD readiness validation](validate-desired-product-state.md)
- [PRD projection](prd-projection.md)

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Formalize the **MCP adapter** as the alpha contract for exposing semantic product
knowledge to AI agents: specify what the adapter exposes (interpreted knowledge,
relationships, provenance, validation findings, derived artifacts), what it must not
do (create knowledge, introduce parallel representations, treat projections as
canonical), how agents remain grounded in the same model humans use, and how the
adapter completes the alpha architecture chain from semantic documents through
agent consumption. Deliver reference exposure walkthroughs and contract examples
or acceptance fixtures demonstrating adapter-agnostic parity over milestone 3–6
models from multiple storage perspectives — without building MCP servers, protocol
handlers, URI schemes, tool catalogs, or transport in this milestone.

### Users / actors

- AI agents and MCP-compatible clients that need grounded access to product
  knowledge without inventing parallel product state
- Engineers and product collaborators who need agents to reason over the same
  semantic understanding they maintain in the wiki
- Maintainers defining the adapter contract before protocol implementation milestones
- Technical evaluators validating that alpha proves end-to-end semantic wiki →
  agent consumption

### Required behavior

- The adapter exposes **semantic product knowledge** — interpreted concepts,
  relationships, and provenance — normalized from wiki-backed documents, not raw
  storage internals as the primary view
- The adapter exposes **validation findings** and readiness posture from milestone 5
- The adapter exposes **derived artifacts** such as the PRD as read-only projections
  with traceability metadata from milestone 6
- Agents consume the **same explicit knowledge** humans work with — identical
  grounding in primitive identities and relationship semantics
- The adapter **does not create** product knowledge; it surfaces what interpretation,
  validation, and projection already derived
- **Semantic documents remain authoritative**; the adapter does not treat generated
  prose or projections as editable canonical state
- JSON, Markdown, Org, and SQLite adapter paths normalize to the same exposure
  contract over the same interpreted, validated, and projected model
- Disabling the adapter does not alter product meaning

### Constraints

- Operate on the semantic product knowledge model from milestones 3–6 — do not
  redefine ontology or introduce MCP-specific primitive types
- Local-first; synthetic fixtures only in demos and contract examples
- Adapter-independent semantics: exposure reasoning belongs at the product-knowledge
  layer, not inside protocol or storage-format-specific modules
- Derivation over duplication: the adapter exposes derived views; it does not
  maintain parallel product-fact layers
- MCP is an integration layer — record open protocol and implementation choices as
  decisions to make later, not decisions made here
- Align with thinking principles: explicit models, small ontology, traceability,
  agents as consumers of the model, resist implementation-led ontology

### Non-goals

- MCP server, protocol SDK, or transport implementation
- Enumerating resources, tools, prompts, or URI schemes
- Defining API schemas or authentication
- CLI MCP-shaped command surface
- Automated MCP integration tests
- Agent orchestration, sampling, or autonomous planning
- External tool sync or cloud deployment
- Editable PRD or projection-as-source-of-truth workflows

### Success definition

The MCP adapter contract is ratified, contract examples or acceptance fixtures
demonstrate exposure of semantic product knowledge, validation findings, and
derived artifacts without introducing a new source of truth, and reviewers confirm
the contract completes the alpha architecture — ready for protocol implementation
in later milestones without treating MCP as the product or part of the ontology.

## Links

- Release: [docs/releases/alpha.md](../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/7
- Prior milestones: [readable-semantic-wiki.md](readable-semantic-wiki.md),
  [semantic-interpretation-layer.md](semantic-interpretation-layer.md),
  [validate-desired-product-state.md](validate-desired-product-state.md),
  [prd-projection.md](prd-projection.md)
- Superseded graph-first MCP docs: [mcp-shaped-cli-commands.md](mcp-shaped-cli-commands.md),
  [mcp-server-roots-resources-tools.md](mcp-server-roots-resources-tools.md),
  [local-mcp-desired-product-state.md](local-mcp-desired-product-state.md)
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/95

## Risks or blockers

- Tension between keeping the spec implementation-agnostic and wanting executable
  proof — mitigate by separating adapter contract ratification (this milestone)
  from protocol server implementation (later milestones)
- Collapsing the adapter into protocol design — mitigate by defining exposure
  boundaries without prescribing resources, tools, or transport
- Treating MCP as the product or primary authoring surface — mitigate by explicit
  exposure-over-creation rules and wiki-only canonical edit path
- Agent clients inferring authority from generated PRD prose — mitigate by
  read-only projection exposure with traceability metadata
- Prior graph-first MCP milestone docs may mislead implementers — mitigate by
  superseding them with pointers to this contract

## Completion evidence

- [ ] MCP adapter model section reviewed and accepted as alpha adapter contract
- [ ] Demo walkthrough completed with synthetic data
- [ ] Acceptance criteria satisfied
- [ ] Contract examples or acceptance fixtures demonstrate adapter-agnostic
  exposure parity at the model level
- [ ] Related GitHub issues closed or retargeted for revised scope
- [ ] Prior MCP milestone documents marked superseded with links to this contract
