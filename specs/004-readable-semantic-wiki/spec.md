# Feature Specification: Readable Semantic Wiki

**Feature Branch**: `004-readable-semantic-wiki`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Formalize the semantic document model as the alpha wiki contract: specify how each supported product primitive type maps to a semantic document (metadata, body, relationships, identity, provenance), define interpretation and recoverability requirements at the domain boundary, and deliver reference mappings or example document models plus contract examples or acceptance fixtures demonstrating that milestone 2 primitives can be represented by the model."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author Product Knowledge as Readable Semantic Documents (Priority: P1)

A product owner or engineer captures product intent in human-readable documents where each document represents exactly one typed product primitive. Structured metadata carries formal semantics (identity, type, display name, lifecycle status, and type-specific fields); the body carries explanatory prose a colleague can read without specialized tooling. The author understands that required semantics live in metadata, not only in narrative text.

**Why this priority**: Alpha's thesis is that product knowledge should live in documents humans can read and edit directly. Without a clear semantic document model, authors and adapters would invent incompatible shapes and presentation would leak into the ontology.

**Independent Test**: Present synthetic example semantic documents for at least two primitive types (for example Capability and Story). A reviewer who has not used SpecAble can read the body and understand product intent; a maintainer can identify from metadata alone which primitive type, identity, status, and required formal fields each document represents.

**Acceptance Scenarios**:

1. **Given** a synthetic Capability primitive from the prior milestone, **When** it is represented as a semantic document under the contract, **Then** metadata contains stable identity, primitive type, display name, lifecycle status, and all required type-specific formal fields; the body explains intent without being the sole carrier of those required fields.
2. **Given** a synthetic Story primitive with typed relationships to other primitives, **When** it is represented as a semantic document, **Then** relationships reference target primitives by stable identity and explicit relationship kind from the canonical ontology—not by display name, file location, or adapter-local identifiers.
3. **Given** a semantic document whose body prose is edited, **When** non-identity metadata fields change, **Then** stable primitive identity and typed relationship edges remain recoverable at the domain boundary.
4. **Given** a human-readable example document, **When** a product owner opens it in an ordinary editor, **Then** they can understand product intent without running SpecAble or specialized parsers.

---

### User Story 2 - Define Adapter Contracts Before Implementation (Priority: P2)

A maintainer preparing future readable backends (Markdown, Org, Notion, Confluence, and similar) needs a format-agnostic semantic contract. The contract specifies what every adapter must preserve: metadata versus body responsibilities, stable identity rules, relationship semantics, and provenance expectations—without prescribing concrete syntax, frontmatter keys, or parser algorithms.

**Why this priority**: Adapter implementations in later milestones depend on a ratified contract. Defining the contract first prevents each backend from inventing its own shape and leaking storage-specific concepts into the product primitive ontology.

**Independent Test**: Review the semantic document model documentation and per-type reference mappings. Confirm that two representation perspectives (structured storage and human-readable prose) express the same semantic contract for the same synthetic primitives without adapter-specific identifiers appearing as canonical primitive identity.

**Acceptance Scenarios**:

1. **Given** the ratified semantic document model, **When** a maintainer evaluates a candidate adapter design, **Then** they can determine whether it satisfies metadata, body, identity, relationship, and provenance requirements without ambiguity.
2. **Given** contract examples showing the same synthetic primitives in structured storage form and human-readable document form, **When** a reviewer compares them, **Then** both perspectives preserve stable identity, type, status, required formal fields, typed relationships, and available provenance.
3. **Given** adapter-local identifiers (file paths, page IDs, database row keys), **When** they appear in storage, **Then** the contract states they are indexing or sync references—not canonical primitive identity.
4. **Given** the contract, **When** a maintainer plans a future readable backend, **Then** no concrete wiki syntax, file layout, or parser design is required to ratify the model in this milestone.

---

### User Story 3 - Validate Readiness for Semantic Interpretation (Priority: P3)

Reviewers and future agent clients need confidence that the semantic document model is sufficient for the next milestone to derive a typed graph, run validation, project artifacts, and expose agent interfaces—without revisiting ontology boundaries. A conceptual demo walkthrough with synthetic product knowledge ratifies the model.

**Why this priority**: This milestone bridges completed primitive create/inspect work and the structured product wiki that later milestones interpret, validate, project, and expose. Reviewer sign-off prevents rework when interpretation and adapter work begins.

**Independent Test**: Complete the documented demo walkthrough using synthetic primitives only. Reviewers confirm the model answers what makes a document a semantic node, what belongs in metadata versus body, how relationships are represented, what must have stable identity, what provenance is preserved, and what makes documents human-readable yet machine-processable.

**Acceptance Scenarios**:

1. **Given** reference mappings for each core alpha primitive type, **When** a reviewer inspects them, **Then** each type defines metadata fields, body role, relationship participation, identity rules, and provenance expectations aligned with the existing product primitive ontology.
2. **Given** milestone 2 primitives (Objective, Actor, Persona, Domain Concept, Capability, Expected Result, Workflow, Story), **When** represented under the semantic document model, **Then** typed semantics and stable IDs are recoverable in principle at the domain boundary without prose-only inference for required fields.
3. **Given** the conceptual demo walkthrough, **When** a reviewer follows it with synthetic data, **Then** they can trace how semantic documents would be interpreted into typed primitives and how a second representation perspective expresses the same contract.
4. **Given** missing provenance or source information in an example document, **When** the model is applied, **Then** the gap is detectable in later stages rather than silently invented.

---

### Edge Cases

- **Body-only required semantics**: A document that encodes required type, status, identity, or mandatory relationships only in prose MUST be considered non-conformant; the contract MUST make this failure mode explicit.
- **Identity tied to display name or storage location**: Renaming a document or moving it between adapters MUST NOT reassign primitive identity; the contract MUST forbid adapter-local names as canonical IDs.
- **Relationship edit without identity change**: Removing or changing a relationship edge MUST NOT alter source or target primitive identity.
- **Partial provenance**: Documents with no source references or authorship context MUST remain valid; later interpretation reports gaps rather than fabricating provenance.
- **Type-specific field gaps**: A semantic document missing required formal fields for its primitive type MUST be detectable at interpretation with actionable errors referencing semantic fields and primitive identity—not parser internals.
- **Product Decision, Product Risk, and Evidence boundary**: These types remain outside core alpha primitive scope unless a proven ontology gap requires extension; metadata versus provenance split for operating metadata is documented as an assumption, not a new primitive layer.
- **Deprecated or Draft lifecycle**: Status in metadata governs lifecycle; body prose MUST NOT be the authoritative status carrier.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The semantic document model MUST define a **semantic node** as a document representing exactly one product primitive from the existing ontology—not a new wiki-only primitive type.
- **FR-002**: Each semantic document MUST separate **structured metadata** (formal semantics SpecAble needs without inferring from prose) from a **document body** (human-authored explanation of intent, context, and rationale).
- **FR-003**: Metadata MUST include at minimum: stable primitive identity, primitive type, display name, lifecycle status (`Draft`, `Active`, or `Deprecated`), and type-specific formal fields defined by the primitive type.
- **FR-004**: Metadata MUST NOT use adapter-specific identifiers (file paths, page IDs, row keys) as canonical primitive identity; adapters MAY store such references for sync or indexing only.
- **FR-005**: The document body MUST remain interpretable by humans without SpecAble; MUST NOT be the sole carrier of required formal semantics; and MAY include headings, lists, and formatting natural to the authoring medium.
- **FR-006**: **Relationships** MUST connect semantic documents by stable primitive identity and explicit relationship kind from the canonical product primitive ontology.
- **FR-007**: Every relationship MUST map to the same semantic edge regardless of authoring style: source identity, relationship kind, and target identity.
- **FR-008**: Editing or removing a relationship MUST NOT silently reassign primitive identity.
- **FR-009**: **Stable identity** MUST survive round-trip through storage adapters, human edits to body prose and non-identity metadata, and projection to structured storage representations used as proving adapters.
- **FR-010**: Identity MUST NOT depend on display name, file name, or storage location.
- **FR-011**: **Provenance** MUST support, where available: source references to external evidence, authorship and change context, and derivation lineage linking generated outputs to contributing primitives.
- **FR-012**: Provenance MUST be structured metadata or linked records—not prose buried only in the body; missing provenance MUST be reportable as a gap in later stages, not silently invented.
- **FR-013**: A semantic document MUST be **machine-processable** when required metadata can be decoded into typed primitive values, primitives can be listed and filtered without natural-language processing on the body, relationships resolve by stable ID, schema violations produce actionable errors, and graph-oriented artifacts can be derived from the same semantic content.
- **FR-014**: The model MUST provide **reference mappings or example document models** for each core alpha primitive type: Objective, Actor, Persona, Domain Concept, Capability, Expected Result, Workflow, and Story.
- **FR-015**: Each per-type mapping MUST specify metadata fields, body role, relationship participation, identity rules, and provenance expectations aligned with the existing product primitive ontology from the prior milestone.
- **FR-016**: **Contract examples or acceptance fixtures** MUST demonstrate at least two representation perspectives (structured storage and human-readable prose) satisfying the same semantic contract for milestone 2 primitives without adapter-specific concepts in the ontology.
- **FR-017**: The model MUST allow recovery of milestone 2 primitive semantics—identity, type, status, and required formal fields—at the domain boundary without prose-only inference for required fields.
- **FR-018**: The semantic document model MUST be documented and ratified as the alpha wiki contract, preparing for additional readable backends without prescribing their syntax or building parsers in this milestone.
- **FR-019**: Demos, contract examples, and acceptance fixtures MUST use synthetic product knowledge only.
- **FR-020**: The representation MUST remain local-first and tool-agnostic: documents remain meaningful in ordinary editors without network services or vendor-specific runtimes.
- **FR-021**: Errors and validation messages defined by the contract MUST reference semantic fields and primitive identity, not parser or adapter implementation internals.
- **FR-022**: Future agent clients MUST be able to consume the same interpreted primitives whether the backing store is a wiki page, structured fixture, or indexed storage—per the contract, not per adapter shape.

### Key Entities

- **Semantic Document**: The durable, human-facing unit of product knowledge representing exactly one typed product primitive, composed of structured metadata and an explanatory body.
- **Structured Metadata**: Machine-interpretable fields outside the narrative body that map to the existing product primitive schemas—identity, type, display name, status, type-specific formal fields, and structured provenance.
- **Document Body**: Human-authored prose explaining intent, context, and rationale; supplements but does not replace required formal metadata.
- **Semantic Relationship Edge**: A typed connection between two semantic documents identified by source primitive identity, relationship kind, and target primitive identity.
- **Stable Primitive Identity**: A durable, adapter-independent identifier for a product primitive that survives storage changes and non-identity edits.
- **Provenance Record**: Structured information tracing where product knowledge came from, how it evolved, and which primitives contributed to derived outputs.
- **Reference Mapping**: Per-primitive-type documentation showing how ontology fields, relationships, and provenance expectations map onto semantic document structure.
- **Contract Example**: A synthetic demonstration showing the same primitive semantics expressed in two representation perspectives under one semantic contract.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of core alpha primitive types (eight types: Objective, Actor, Persona, Domain Concept, Capability, Expected Result, Workflow, Story) have published reference mappings covering metadata, body role, relationships, identity, and provenance.
- **SC-002**: Contract examples demonstrate semantic parity across at least two representation perspectives for at least four distinct primitive types drawn from milestone 2 fixtures.
- **SC-003**: A reviewer who has not used SpecAble can read synthetic example documents and correctly identify product intent for at least two primitive types in under 5 minutes per document.
- **SC-004**: Maintainers can answer all six contract questions from acceptance criteria—semantic node definition, metadata versus body, relationships, stable identity, provenance, human-readable yet machine-processable—in a single review session without unresolved ambiguity.
- **SC-005**: Reviewers confirm the model is sufficient for the next milestone to derive a graph, run validation, project artifacts, and expose agent resources without revisiting ontology boundaries.
- **SC-006**: The conceptual demo walkthrough completes with synthetic data only and covers mapping, human readability, domain-boundary recoverability, and adapter-agnostic parity.
- **SC-007**: Zero contract examples use adapter-local identifiers as canonical primitive identity.

## Assumptions

- Milestone 2 (create and inspect primitives) is complete: core alpha primitives persist with stable IDs, typed fields, and JSON- or SQLite-backed proving adapters.
- The existing product primitive ontology remains authoritative; the wiki is a representation layer, not a parallel source of truth or new primitive taxonomy.
- Product Decision, Product Risk, and Evidence remain outside core alpha scope; their metadata versus provenance boundary may be refined when those types are introduced.
- Minimum required fields per primitive type at `Draft` status follow the same rules established in milestone 2; stricter `Active`-status enforcement belongs to later validation milestones.
- Concrete wiki syntax (Markdown frontmatter, Org property drawers, Notion properties) is intentionally deferred; the contract records open format choices as future implementation decisions, not decisions made in this milestone.
- The semantic interpretation layer (how documents become graph edges) is defined in the next milestone; this milestone ratifies the document model only.
- Structured storage adapters from milestones 1–2 remain valid proving implementations illustrating one representation perspective.

## Dependencies

- Requires completed [Create and inspect primitives](../003-create-inspect-primitives/spec.md): persisted primitives with stable IDs, typed fields, and local project roots.
- Builds on the canonical product primitive ontology and domain schemas established in v0 and alpha milestones 2–3.

## Out of Scope

- Choosing or specifying Markdown versus Org versus other concrete syntax, frontmatter keys, property drawers, parser algorithms, or file layout.
- Reference adapter, parser, or CLI commands that read or write wiki documents.
- Automated contract or parity tests proving executable round-trip (deferred to later milestones).
- Semantic interpretation layer definition and graph derivation from wiki content (next milestone).
- Validation rules, Active-status field enforcement, and PRD readiness checks.
- PRD projection templates and generated artifact pipelines.
- MCP resources, tools, or server protocol integration.
- Notion, Confluence, or other production external adapters and sync.
- Introducing new ontology primitives unless a proven gap in the existing model requires it.
- Update, delete, archive, or relationship-management commands beyond what milestone 2 already provides.
