# Readable semantic wiki

**Release:** [docs/releases/alpha.md](../../releases/alpha.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition.

## Goal

Build a **Markdown storage backend** and an **Org storage backend** that write
product primitives as human-readable wiki files in a SpecAble project root. By
the end of this milestone, `specable init --storage md` and `specable init --storage org`
produce editable file layouts where each primitive is a separate `.md` or `.org`
file with typed metadata (frontmatter) separable from body prose, typed
relationships by stable ID, provenance fields, and lifecycle status — all
recoverable by `specable primitive list` and `specable primitive get`.

Having two backends at the same abstraction level (Markdown + Org, like
JSON + SQLite before them) proves the StorageBackend contract is truly
adapter-independent and forces the wiki semantics to be format-invariant.

## Why this matters

Milestones 1 and 2 proved that product primitives persist as structured data
in local project roots via JSON and SQLite. Alpha's thesis is stronger:
**product knowledge should live in documents humans can read and edit directly**,
with formal semantics SpecAble can interpret.

JSON and SQLite store primitives in opaque containers (file arrays, database
tables). Markdown and Org let authors open files in ordinary editors, read
product intent without SpecAble, and edit prose while keeping structured
metadata machine-decodable.

Building two readable backends in one milestone mirrors the strategy that
worked for milestones 1–2, where JSON + SQLite forced the storage abstraction
to be clean. Here, Markdown + Org force the wiki document semantics to be
format-invariant and prove that switching between local Markdown files and
future Notion / Confluence adapters follows the same pattern.

## Semantic document model

The following is the **design contract** this milestone implements across both
Markdown and Org backends. Each backend MUST produce and consume files that
satisfy these rules.

### Semantic node

A **semantic document** represents exactly one product primitive from the
existing ontology (Objective, Actor, Persona, Domain Concept, Capability,
Expected Result, Workflow, Story, and related types). The document is the
durable, human-facing unit of product knowledge; it is not a new primitive
type.

A document is a semantic node when SpecAble can:

- identify which primitive type it represents;
- recover stable primitive identity across reads, edits, and adapter changes;
- separate machine-interpretable structure from human-authored explanation;
- participate in typed relationships with other semantic documents by stable
  identity; and
- preserve provenance needed for traceability.

### Structured metadata

**Metadata** carries formal semantics SpecAble needs to interpret the document
without inferring meaning from prose alone. In Markdown this is YAML
frontmatter (between `---` delimiters); in Org this is a property drawer
(`:PROPERTIES:` … `:END:`). Both map to the existing primitive schemas from
`@specable/domain`.

Metadata MUST include, at minimum:

- **stable primitive identity** — durable across storage backends and edits;
- **primitive type** — which ontology type the document represents;
- **display name** — the human-facing title or label;
- **lifecycle status** — `Draft`, `Active`, or `Deprecated` per domain rules;
- **type-specific formal fields** — required and optional semantic properties
  defined by the primitive type (not free-form tags invented by the adapter).

Metadata MUST NOT embed adapter-specific identifiers (file paths, database
row keys) as the canonical primitive identity. Adapters MAY store such
references for sync or indexing, but they are not the semantic ID.

### Document body

The **body** is human-authored prose that explains intent, context, rationale,
and nuance — the material a product owner would write for another human. It
supplements structured metadata; it does not replace typed fields that belong
in metadata.

The body:

- MAY include headings, lists, and formatting natural to the authoring medium;
- MUST remain interpretable by humans without running SpecAble;
- MUST NOT be the sole carrier of required formal semantics (type, status,
  identity, mandatory relationships, or type-specific required fields);
- SHOULD stay aligned with the primitive it represents so validation and
  projection can cite both structure and explanation.

### Relationships

**Relationships** connect semantic documents by **stable primitive identity** and
**relationship kind** from the canonical product primitive ontology (for
example, story→actor, capability→workflow).

Conceptually:

- A relationship references **source** and **target** primitive identities, not
  adapter-local names or file paths.
- The relationship **kind** is explicit and typed; it is not inferred only from
  hyperlink text or document proximity.
- Relationships MAY be authored inline with a document, collected in a
  companion structure, or expressed through conventions defined by a backend —
  but every backend MUST map to the same semantic edge: `(source id, kind,
  target id)`.
- Removing or editing a relationship MUST NOT silently reassign primitive
  identity.

### Stable identity

The following MUST have **stable, adapter-independent identity**:

- each product primitive (semantic document);
- each typed relationship edge (identified by source, kind, and target, or an
  equivalent stable edge identity defined at the domain boundary);
- provenance records that trace derived artifacts back to source primitives.

Identity MUST survive:

- round-trip through a storage adapter;
- human edits to body prose and non-identity metadata fields;
- projection to Markdown, Org, JSON, or SQLite representations.

Identity MUST NOT depend on display name, file name, or storage location.

### Provenance

**Provenance** preserves where product knowledge came from and how it evolved,
supporting traceability without inventing meaning.

The model MUST support, where available:

- **source references** — pointers to external evidence (research, decisions,
  interviews, tickets) that informed the primitive;
- **authorship and change context** — who or what last shaped the knowledge,
  when material facts changed, and whether content is observed vs asserted;
- **derivation lineage** — which primitives contributed to generated outputs
  (PRD sections, validation findings, summaries).

Provenance is structured metadata or linked records — not prose buried only in
the body. When source information is missing, later stages report the gap
rather than fabricating provenance.

### Human-readable and machine-processable

A semantic document is **human-readable** when a product owner can open it in
ordinary editing tools, understand the product intent, and revise prose without
specialized SpecAble knowledge.

It is **machine-processable** when SpecAble can:

- decode metadata into typed primitive values at the domain boundary;
- list and filter primitives without NLP on the body;
- resolve relationships by stable ID;
- detect schema violations and missing required fields with actionable errors;
- derive graph, validation, and projection artifacts from the same semantic
  content.

Readability and processability are joint requirements: neither unstructured
prose alone nor opaque structured stores satisfy the wiki thesis.

## File layouts and naming conventions

### Markdown backend

A Markdown-backed project root stores one file per primitive under a
type-named directory:

```
project-root/
├── specable.json              # unchanged project manifest
├── capabilities/
│   ├── cap-schedule-session.md
│   └── cap-...
├── actors/
│   ├── actor-care-coach.md
│   └── actor-client.md
├── objectives/
├── personas/
├── domain-concepts/
├── expected-results/
├── workflows/
├── stories/
└── capability-concept-links/
```

Each `.md` file uses YAML frontmatter for metadata and a Markdown body:

```markdown
---
id: cap-schedule-session
type: Capability
name: Schedule coaching session
status: Active
actors:
  - actor-care-coach
expectedResults:
  - result-less-manual-scheduling
workflows:
  - workflow-session-scheduling
domainConcepts:
  - concept-session
description: >
  Let coaches create, update, and confirm coaching sessions.
---
Body prose explaining intent, context, and rationale goes here.
Human-readable without SpecAble.
```

### Org backend

An Org-backed project root uses the same type-named directory layout with
`.org` file extensions and Org-mode property drawers for metadata:

```
project-root/
├── specable.json
├── capabilities/
│   ├── cap-schedule-session.org
│   └── cap-...
├── actors/
│   ├── actor-care-coach.org
│   └── actor-client.org
└── ...
```

Each `.org` file uses a property drawer and Org headings:

```org
#+TITLE: Schedule coaching session

:PROPERTIES:
:id:       cap-schedule-session
:type:     Capability
:status:   Active
:actors:   actor-care-coach
:expectedResults: result-less-manual-scheduling
:workflows: workflow-session-scheduling
:domainConcepts: concept-session
:END:

Body prose explaining intent, context, and rationale goes here.
Human-readable without SpecAble.
```

## What this milestone builds

### Storage backend implementations

Two new implementations of the `StorageBackend` contract from
`@specable/core`:

1. **`MarkdownStorageBackend`** — reads and writes `specable.json`-configured
   project roots as per-type directories of `.md` files with YAML frontmatter.
2. **`OrgStorageBackend`** — same contract, same layout, `.org` file extension
   with Org property drawers.

Each backend supports `bootstrap`, `describe`, `create`, `list`, and `get`
exactly like the existing `JsonStorageBackend` and `SqliteStorageBackend`.

### Schema wiring

- `StorageType` gains `"md"` and `"org"` literals alongside `"json"` and
  `"sqlite"`.
- `PrimitiveTypes.ts` maps canonical primitive types to file naming
  conventions (directory name + file extension).
- Frontmatter/property-drawer encoding derives from the same
  `schemaByType` registry used by JSON decode.
- A shared `wiki-file-layout.ts` module (or equivalent) provides the
  per-type directory→file mapping and name-sanitization logic common to
  both backends.

### Routing and CLI

- `RoutedStorageBackend` routes to Markdown or Org backends by
  `config.storage.type`.
- `specable init --storage md` and `specable init --storage org` select
  the new backends at project creation.
- `specable primitive create`, `list`, and `get` work identically across
  all four backends (JSON, SQLite, Markdown, Org).
- `specable project show` reports the storage type and file layout for
  wiki-backed roots.

### Round-trip contracts

Every primitive type supported by create/list/get must round-trip through
both Markdown and Org without semantic loss:

- `create` ⟶ `.md` / `.org` file on disk with decodable metadata
- `list` ⟶ reads all type files, returns summaries
- `get` ⟶ reads single file by ID, returns full decoded primitive
- `describe` ⟶ reports type counts from file system

## Demo

```sh
# Initialize a Markdown-backed project root
specable init ./demo-wiki --storage md

# Create primitives as readable .md files
specable primitive create ./demo-wiki --type Capability --name "Schedule session" --status Draft
specable primitive create ./demo-wiki --type Actor --name "Care coach" --status Active

# Inspect output — human-readable .md files exist on disk
cat ./demo-wiki/capabilities/cap-schedule-session.md
cat ./demo-wiki/actors/actor-care-coach.md

# List and get work identically to JSON/SQLite
specable primitive list ./demo-wiki
specable primitive get ./demo-wiki --id cap-schedule-session

# Repeat with Org backend
specable init ./demo-org --storage org
specable primitive create ./demo-org --type Capability --name "Schedule session" --status Draft
cat ./demo-org/capabilities/cap-schedule-session.org

# Prove parity: create the same primitive on both backends, get output matches
```

## Expected result

- Markdown and Org storage backends exist as `StorageBackend` implementations
  in `@specable/core`.
- `specable init --storage md` and `specable init --storage org` produce
  correct per-type directory layouts.
- `specable primitive create|list|get` work identically on wiki-backed roots.
- YAML frontmatter (Markdown) and Org property drawers encode the same
  structured metadata, decoded at the domain boundary via existing `Schema`.
- Wiki files are human-readable in ordinary editors without SpecAble.
- JSON/SQLite backends remain fully operational — all four backends pass the
  same storage round-trip test suite.

## Architectural placement

```text
Human-editable semantic documents (wiki)          ← this milestone
        │
        ▼  interpret
Semantic graph (primitives + typed relationships)  ← next milestone
        │
        ▼  derive
Validation · PRD projection · MCP resources
```

- **Wiki files** — primary editable representation of product knowledge;
  authors edit `.md` or `.org` files in ordinary editors.
- **Graph** — semantic interpretation of wiki content, not a separately
  authored parallel source of truth (next milestone).
- **JSON and SQLite** — remain as proving adapters; four-backend parity
  proves the StorageBackend contract is format-independent.
- **Markdown and Org** — are the readable wiki backends for alpha; additional
  backends (Notion, Confluence) follow the same adapter pattern.

## Acceptance criteria

- [ ] `StorageType` includes `"md"` and `"org"` alongside `"json"` and
      `"sqlite"`.
- [ ] `MarkdownStorageBackend` implements `bootstrap`, `create`, `list`, `get`,
      and `describe` per the `StorageBackend` contract.
- [ ] `OrgStorageBackend` implements the same contract.
- [ ] YAML frontmatter encoding and decoding for Markdown maps to existing
      `@specable/domain` primitive schemas.
- [ ] Org property drawer encoding and decoding maps to the same schemas.
- [ ] `specable init --storage md` creates type directories and empty
      initialization.
- [ ] `specable init --storage org` creates type directories and empty
      initialization.
- [ ] `specable primitive create` on a Markdown root writes a valid `.md` file
      with YAML frontmatter.
- [ ] `specable primitive create` on an Org root writes a valid `.org` file
      with property drawer.
- [ ] `specable primitive list` returns correct summaries from both backends.
- [ ] `specable primitive get` returns the full decoded primitive from both
      backends.
- [ ] Created `.md` files are human-readable in an ordinary editor without
      SpecAble.
- [ ] Created `.org` files are human-readable in an ordinary editor without
      SpecAble.
- [ ] Storage round-trip tests exist for both backends covering all alpha
      primitive types.
- [ ] All four backends (JSON, SQLite, Markdown, Org) pass the same
      storage round-trip test suite with no backend-specific test branches.
- [ ] Demo uses synthetic product knowledge only.

## Scope

- Markdown storage backend (YAML frontmatter, per-type directory layout)
- Org storage backend (property drawer, same directory layout)
- `StorageType` schema extension (`"md"` / `"org"`)
- `RoutedStorageBackend` wiring for new backends
- CLI `--storage md` / `--storage org` in `specable init`
- CLI `primitive create|list|get` on wiki-backed roots (no changes needed,
  already delegates to `PrimitiveService` + `StorageBackend`)
- Shared wiki file-layout module (directory names, file naming, ID-to-filename)
- Storage round-trip tests for Markdown and Org backends
- Documentation of the file layouts and frontmatter/property-drawer schemas

## Out of scope

- Semantic interpretation layer (next milestone:
  [semantic-interpretation-layer.md](004-semantic-interpretation-layer.md))
- Validation rules and PRD readiness checks
- PRD projection templates
- MCP resources and tools
- Notion or Confluence adapters
- Introducing new ontology primitives unless a gap in the existing model is
  proven necessary
- Writing Org property drawers in Emacs-specific binary formats — plain-text
  `.org` files only
- Complex Org features (tables, source blocks, LaTeX, timestamps) — only
  property drawers and body prose are required

## Dependencies

- [Create and inspect primitives](002-create-inspect-primitives.md) — provides
  the `PrimitiveService`, `StorageBackend` contract, and CLI `primitive`
  commands this milestone extends.
- [Initialize JSON and SQLite project roots](001-initialize-project-roots.md) —
  establishes the project init flow and `specable.json` format extended here.

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.**

### Build

Implement two new `StorageBackend` implementations — **Markdown** and **Org** —
that store each product primitive as a separate human-readable wiki file in a
type-named subdirectory of the project root. Markdown files use YAML frontmatter
for structured metadata; Org files use property drawers. Extend `StorageType`
with `"md"` and `"org"`, wire through `RoutedStorageBackend`, and support
`specable init --storage md|org`. All four backends (JSON, SQLite, Markdown,
Org) must pass the same storage round-trip test suite with no backend-specific
test branches.

### Users / actors

- Product owners and engineers authoring product knowledge as readable wiki
  files they can open in ordinary editors
- Developers verifying the `StorageBackend` abstraction is truly adapter-
  independent by testing parity across Markdown and Org
- Future Notion/Confluence adapter authors who follow the same pattern

### Required behavior

- `specable init --storage md` creates a project root with per-type `.md` file
  directories and an empty `specable.json`
- `specable init --storage org` creates the same layout with `.org` extensions
- `specable primitive create` on a Markdown root writes a file like
  `capabilities/cap-schedule-session.md` with YAML frontmatter
- `specable primitive create` on an Org root writes a file like
  `capabilities/cap-schedule-session.org` with a property drawer
- `specable primitive list` and `get` read back the same structured data from
  both formats
- JSON and SQLite backends remain fully operational with no behavior change
- Created files pass the same `Schema.decodeUnknown` round-trip as JSON and
  SQLite records
- Round-trip tests cover all alpha primitive types on all four backends

### Constraints

- Extend the existing `StorageBackend` contract — do not create a separate
  wiki-only service interface
- YAML frontmatter decoding must use a YAML parser (not hand-rolled); Org
  property drawer parsing may use a lightweight parser since the subset is
  small (flat key-value pairs only)
- File names derive from primitive IDs, not display names, to stay stable
  across renames
- Body prose is preserved as-is on round-trip; no body-level encoding/
  transformation
- Relationships reference stable IDs, not file paths or wiki links
- Local-first; synthetic demo data only

### Non-goals

- Human-friendly wiki links (e.g. `[[actor-care-coach]]`) — relationship
  resolution is the interpretation layer's job in the next milestone
- Body content parsing or NLP
- Org-mode complex features beyond property drawers and prose
- Notion or Confluence adapters
- Relationship CRUD or graph traversal
- CLI wiki-specific subcommands — `primitive create|list|get` is sufficient

### Success definition

All four backends pass the same storage round-trip test suite. A reviewer can
`specable init --storage md`, create a few primitives, open the `.md` files in
any text editor, confirm they are readable, and re-read them via `specable
primitive list` and `get` — then repeat the same steps with `--storage org`
and confirm semantic parity.

## Links

- Release: [docs/releases/alpha.md](../../releases/alpha.md)
- GitHub Milestone: https://github.com/PathableAI-org/SpecAble/milestone/3
<!-- Superseded: link-primitive-graph.md deleted -->
- Spec Kit spec: TBD
- Issues: https://github.com/PathableAI-org/SpecAble/issues/91 (pivot),
  https://github.com/PathableAI-org/SpecAble/issues/69 (setup — to be revised)

## Risks or blockers

- YAML frontmatter parsing adds a new dependency (`js-yaml` or equivalent)
  — lightweight but must be scoped to the Markdown backend only
- Org property drawer parsing is non-standard; the subset used here (flat
  key-value) is simple enough to parse with regex, but a purpose-built
  sub-parser must be tested for edge cases (colons in values, multi-line)
- Per-type directory layout means `list` must scan multiple directories;
  already handled by the `StorageBackend.list` pattern from JSON/SQLite
- File names derived from IDs must be filesystem-safe (no `/`, no nulls,
  length limits) — enforce at ID assignment or in the wiki file module

## Completion evidence

- [ ] Markdown and Org backends pass all storage round-trip tests
- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed or retargeted for revised scope
- [ ] JSON and SQLite backends unchanged and passing existing tests
- [ ] File layout and frontmatter/property-drawer schemas documented