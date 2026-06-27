<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0
Modified principles: none
Added sections:
  - Technical Standards → Effect services and Requirements (R)
  - .specify/memory/effect-service-patterns.md (new canonical reference)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Service & Layer map, constitution row)
  - .specify/templates/tasks-template.md ✅ updated (Layer/R implementation conventions)
  - .cursor/skills/speckit-plan/SKILL.md ✅ updated
  - .cursor/skills/speckit-tasks/SKILL.md ✅ updated
  - .cursor/skills/speckit-implement/SKILL.md ✅ updated
  - AGENTS.md ✅ updated (Effect Guidance pointer)
Deferred TODOs: none
-->

# SpecAble Constitution

SpecAble is an open-source, local-first product knowledge system. It models durable
product intent as structured primitives instead of prose-only PRDs, tickets, chats,
or design comments. The core product is an agent-readable primitive graph that can
generate or validate specs, design handoffs, roadmap slices, and implementation
artifacts.

## Core Principles

### I. Primitive Graph is Canonical

Objectives, Actors, Personas, Domain Concepts, Capabilities, Expected Results,
Workflows, Stories, and Product Experience Contexts are the durable source of product
meaning. Generated PRDs, stories, summaries, tickets, and design briefs are outputs
derived from the graph, not the source of truth.

**Rules**:

- All product meaning MUST be represented as typed primitives and relationships in
  the graph.
- Generated artifacts MUST be reproducible from graph state; they MUST NOT become
  authoritative inputs that bypass the graph.
- Adapters and tools MUST read from and write to the domain model, not to
  artifact-only stores.

**Rationale**: Prose-only artifacts drift, fragment, and lose traceability. A
canonical graph keeps product intent durable and machine-readable.

### II. Adapter-Based Architecture

The core model MUST NOT depend on Notion, Confluence, Linear, Jira, GitHub, Figma,
or any hosted service. Notion may be the first storage adapter, but all storage
integrations MUST translate into the same domain model.

**Rules**:

- Core packages MUST compile and run without network access when using local fixtures
  or in-memory adapters.
- Each external integration MUST implement a storage or sync adapter with explicit
  input/output schemas mapped to domain primitives.
- Adapter-specific APIs, field names, and IDs MUST NOT leak into core domain types.
- Storage mechanics (filesystem paths, JSON/YAML layout, SQL joins, Notion relations) MUST stay
  behind adapter or repository services. Downstream features (validation, integrity, summary,
  CLI, MCP) MUST depend on typed load/query contracts—not on concrete loader implementations.

**Rationale**: Vendor coupling erodes portability and blocks local-first operation.
Adapters isolate integration churn from product semantics. Hiding storage mechanics behind
repository-style services keeps future adapters (SQL, Notion, MCP) swappable without
rewriting graph consumers.

### III. Local-First and Open-Source First

The first useful version MUST run locally with local fixtures or user-provided
credentials. Hosted cloud, multi-team collaboration, permissions, and managed
integrations are future layers, not prerequisites for core value.

**Rules**:

- v1 features MUST be demonstrable on a developer machine without a hosted SpecAble
  service.
- Cloud, tenancy, permissions, and managed integration features MUST NOT block
  delivery of graph validation, summary generation, or MCP query access.
- Open-source licensing and local execution paths MUST remain first-class, not
  trial modes for a future SaaS.

**Rationale**: Core value is understanding product state from a primitive graph;
that value must not require operational infrastructure.

### IV. MCP-First Interface

SpecAble MUST expose product knowledge through a small, composable interface
suitable for agents. Early tools MUST prioritize read/query, graph traversal,
validation, and artifact generation before write-back automation.

**Rules**:

- MCP tools MUST delegate to library functions with explicit schemas and stable
  error shapes.
- Read and query capabilities MUST ship before automated write-back or sync
  mutations unless a vertical slice explicitly requires minimal writes.
- Public agent interfaces MUST document which primitives and relationships each
  tool touches.

**Rationale**: Agents need reliable, typed access to product knowledge; MCP provides
a composable surface without prematurely committing to UI or vendor workflows.

### V. Library-First Implementation

Core behavior MUST be implemented as reusable TypeScript packages before CLI, MCP,
or UI surfaces. CLI and MCP commands MUST be thin adapters over tested library
functions.

**Rules**:

- Business logic for validation, traversal, artifact generation, and adapter
  translation MUST live in `packages/*` libraries with unit tests.
- CLI and MCP layers MUST NOT contain domain rules that are untested at the library
  layer.
- Consumer-facing Effect services (for example graph load, validation orchestration)
  MUST expose stable contracts; concrete I/O or storage implementations MUST be composed
  via Layers and MUST NOT be the dependency surface for feature modules.
- New capabilities MUST prove value in a library API before gaining a command or
  tool wrapper.

**Rationale**: Thin surfaces reduce duplication and keep agent, CLI, and future UI
paths consistent.

### VI. Explicit Schemas and Typed Boundaries

All primitives, relationships, validation errors, adapter inputs, generated outputs,
and public interfaces MUST be represented with explicit schemas and stable IDs.
Unstructured string parsing MUST be avoided when a typed representation is practical.

**Rules**:

- Domain entities, relationship edges, and validation failures MUST have schema
  definitions and stable identifiers.
- Public library and MCP contracts MUST use typed inputs/outputs; breaking changes
  require semver and migration notes.
- Parsers MAY exist only at adapter boundaries; internal logic MUST operate on typed
  values.

**Rationale**: Agent and human consumers depend on predictable structure; implicit
parsing hides gaps and breaks traceability.

### VII. Traceability Over Chat Behavior

SpecAble is not primarily a chatbot. Every generated artifact MUST be traceable back
to primitives, relationships, decisions, or source records. When information is
missing, the system MUST report the gap instead of inventing product meaning.

**Rules**:

- Artifact generators MUST include references or links to contributing primitives
  and relationships.
- Validation and generation flows MUST surface explicit gap reports rather than
  silently filling unknowns.
- LLM-assisted steps, if used, MUST be constrained by typed graph inputs and MUST
  NOT substitute for missing source data.

**Rationale**: Invented product detail creates false confidence; traceability preserves
trust in outputs.

### VIII. Vertical Slices Only

Each implementation slice MUST produce a demoable product outcome, such as validating
a graph, generating a product summary, exposing an MCP query, or detecting missing
relationships. Horizontal work that builds framework pieces without user-visible or
agent-visible value is prohibited.

**Rules**:

- Plans and tasks MUST tie every phase to an independently demonstrable outcome.
- Shared infrastructure is allowed only when required by the current slice; it MUST
  not expand scope beyond that slice's demo.
- Reviews MUST reject work that adds abstractions without a corresponding vertical
  deliverable.

**Rationale**: Narrow, end-to-end slices prove the primitive graph model before
platform expansion.

### IX. Human-Facing Artifacts Matter

The graph is valuable only if it helps humans understand product state. Early work
MUST include Markdown or similar generated summaries that explain objectives,
workflows, capabilities, expected results, design contexts, and gaps.

**Rules**:

- Vertical slices SHOULD include at least one human-readable artifact derived from
  the graph.
- Summaries MUST reflect current graph state and MUST call out missing links or
  incomplete areas.
- Presentation format MAY evolve, but v1 MUST not rely on a full UI to communicate
  product state.

**Rationale**: Agents and adapters amplify value only when humans can audit and
correct the underlying graph.

### X. Keep the First Version Narrow

Do NOT build a broad product-management SaaS, hosted cloud platform, full UI, or
replacement for Notion/Linear/Jira/Figma in the initial version. Prove the primitive
graph, validation, summary generation, and minimal agent access first.

**Rules**:

- v1 scope MUST exclude full PM suites, enterprise permissions, and vendor
  replacements unless explicitly amended by constitution revision.
- Feature proposals MUST justify how they advance graph canonicality, validation,
  summaries, or agent access—not general PM parity.
- Complexity beyond v1 goals MUST be recorded in plan Complexity Tracking with a
  rejected simpler alternative.

**Rationale**: Focus preserves momentum and validates the core thesis before
operational or UX expansion.

## Technical Standards

**Language and tooling**

- TypeScript and pnpm are the default stack for libraries, CLI, and MCP adapters.
- Prefer Effect for typed services, dependency management, configuration, and errors
  when it keeps the implementation clear.
- Use Zod, Effect Schema, or an equivalent schema system for validation at all public
  boundaries.

**TypeScript type safety**

- `any` MUST NOT appear in library, CLI, or test source. Use generics, branded types,
  Schema-inferred types, or `unknown` with narrowing at boundaries.
- Type assertions (`as`) and unchecked casts MUST be avoided. Prefer generic helpers,
  closed-over decode functions, Schema decode, and Effect service contracts so types
  flow without widening.
- When a cast is unavoidable (for example bridging an external library with incomplete
  types), it MUST be localized, documented with a one-line rationale, and covered by
  tests at that boundary.
- `null` MUST NOT be used for optional or missing values. Use `Option` for optional
  data, tagged errors or `Effect.fail` for expected failures, and defects only for
  unrecoverable bugs.

**Storage and service abstractions**

- Graph and adapter I/O MUST expose repository- or store-shaped services to consumers
  (for example `GraphRepository.load(projectPath)`), not file-loader internals.
- File-backed JSON loading, Node filesystem access, and future SQL/Notion adapters
  are implementation details composed in `services/` Layers—not imported by validation,
  integrity, summary, or CLI command modules.

**Effect services and Requirements (`R`)**

See [effect-service-patterns.md](./effect-service-patterns.md) for examples and
anti-patterns.

- Every `Effect<A, E, R>` MUST declare dependencies in `R`. Access services with
  `yield* Tag` inside `Effect.gen`; do NOT pass service instances as function parameters.
- Platform tags (`FileSystem`, `SqlClient`, etc.) MUST be resolved during Layer
  construction (`Effect.gen` inside `Layer.effect` / `Effect.Service` effect blocks),
  not in CLI command modules.
- Consumer-facing service contracts (Principle V) SHOULD expose public methods with
  `R = never` when platform deps are absorbed at Layer build. If a method still
  requires a tag at call time, its signature MUST include that tag in `R` — do not
  claim `never` while closing over unstated dependencies.
- Live Layers MUST be composed at one composition root per application entrypoint
  (for example `packages/cli/src/bin.ts` + `packages/cli/src/services/Layers.ts`).
  Library packages export per-feature Live modules; they MUST NOT export a
  pre-composed god Layer that hides backend selection.
- `@effect/platform-node` MUST NOT be imported from library `src/` (only entrypoints
  and test harnesses).
- Tests MUST provide Layers (`Effect.provide`) — prefer `@effect/vitest` `it.effect`
  with test or live platform Layers.
- Feature plans touching I/O MUST document a Service & Layer map: tags introduced,
  Live Layer export paths, composition root, and which tags appear in public method
  `R` vs absorbed at Layer build.

**Testing**

Tests MUST cover, using synthetic data where appropriate:

- Schema validation for primitives, relationships, and adapter payloads
- Graph traversal and query behavior
- Missing-link detection
- Duplicate-name detection
- Artifact generation and traceability metadata
- Adapter translation to and from the domain model

**Structure**

- Domain logic lives in `packages/*`.
- CLI, MCP, and future UI surfaces are adapters over those packages.
- Local fixtures and user-provided credentials are valid v1 inputs; hosted services
  are optional adapters, not core dependencies.

## Development Workflow

1. **Constitution first**: Every feature plan MUST pass the Constitution Check before
   Phase 0 research and again after Phase 1 design.
2. **Library before surface**: Implement and test library APIs before CLI or MCP
   wiring.
3. **Vertical slice delivery**: Ship demoable outcomes per slice; avoid horizontal
   framework-only milestones.
4. **Gap visibility**: Prefer explicit validation errors and gap reports over silent
   defaults or inferred product meaning.
5. **Compliance review**: Pull requests MUST note which principles apply and confirm
   no undeclared constitution violations; justify exceptions in Complexity Tracking.

## Governance

This constitution supersedes ad hoc practices for SpecAble planning and
implementation. Amendments require:

1. A documented proposal explaining the change and impact on existing specs and
   code.
2. A semver bump to `CONSTITUTION_VERSION` following:
   - **MAJOR**: Backward-incompatible principle removals or redefinitions.
   - **MINOR**: New principles or materially expanded guidance.
   - **PATCH**: Clarifications, wording, or non-semantic refinements.
3. Synchronization of dependent templates (plan, spec, tasks, checklists) and agent
   guidance under `.cursor/rules/` when principles affect workflow gates.
4. Recording ratification in the Sync Impact Report comment at the top of this file.

All implementation plans, specifications, and task lists MUST verify compliance with
Core Principles, Technical Standards, and Development Workflow. Use
`.specify/memory/constitution.md` as the authoritative reference during `/speckit-plan`,
`/speckit-specify`, `/speckit-tasks`, and `/speckit-implement`.

**Version**: 1.2.0 | **Ratified**: 2026-06-23 | **Last Amended**: 2026-06-27
