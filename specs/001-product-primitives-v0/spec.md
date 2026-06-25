# Feature Specification: SpecAble v0 — Product Primitive Graph

**Feature Branch**: `001-product-primitives-v0`

**Created**: 2026-06-23

**Status**: Clarified

**Input**: User description: "Build the first release of SpecAble focused only on product primitives. SpecAble v0 is a local-first, open-source product primitive graph library and CLI..."

## Clarifications

### Session 2026-06-25

- Q: When a graph project contains duplicate primitive IDs, how should `specable check` behave? → A: Enforce ID uniqueness at the storage/repository boundary during load (analogous to SQL unique constraints); file-backed loaders fail on the first duplicate; the CLI maps the storage error to a `duplicate-id` validation failure with exit code `1` (not exit `2`).
- Q: For generated story text, which values fill the template placeholders? → A: Prefer linked primitive display names; fall back to primitive IDs only when the name is missing or whitespace-only.
- Q: Where should advisory quality warnings (FR-013–FR-026) appear in CLI output artifacts? → A: Per-primitive advisories emit as validation **warnings** in `validation.json`; cross-primitive and graph-level heuristics (e.g., duplicate names, orphans, workflow derivability per FR-016) belong in `integrity-report.json`.
- Q: What satisfies FR-012 Domain Concept linkage for Active Capabilities? → A: Either a direct `domainConcepts` reference on the Capability or a Capability Concept Link pointing at the Capability counts; Capability Concept Link is preferred but not required.
- Q: How should validation and integrity artifacts split duplicate Active story triple reporting? → A: Validation emits `duplicate-story-triple` **failure** findings in `validation.json` (drives exit `1`); `integrity-report.json` includes the structured `duplicateStoryTriples` summary section for fix-up context without re-classifying severity.

### Session 2026-06-24

- Q: Where should domain models live in Phase 2? → A: In a dedicated workspace package (`@specable/domain`) that `@specable/cli` depends on—not embedded under `packages/cli/src/domain/`.
- Q: How should enumerated domain values be represented? → A: Effect Schema literal unions (Schema union types); native TypeScript `enum` declarations are prohibited.
- Q: What is the preferred representation for closed-set domain values? → A: Always prefer Schema union types over native TypeScript enums.
- Q: What is the scope boundary of `@specable/domain` vs `@specable/cli`? → A: `@specable/domain` holds primitive schemas, Schema literal unions, reference types, and domain tagged errors only; graph types, loaders, validation, integrity, summary, and CLI stay in `@specable/cli`. The only logic in `@specable/domain` is that embedded in Effect Schema itself.
- Q: How should schemas express semantic meaning and field-level validation? → A: Leverage Effect Schema annotations to describe semantic meaning and encode validation wherever Schema supports it; logic beyond Schema capabilities belongs in downstream packages that consume these schemas.
- Q: What testing is required in `@specable/domain`? → A: Minimal—focused on encode/decode round-trips for complex schema cases only; comprehensive validation and graph behavior tests live in consuming packages.
- Q: What severity should duplicate normalized names within a primitive type receive? → A: Integrity **warnings** only—report in the integrity report but do not fail validation or cause a non-zero CLI exit code on names alone.
- Q: What CLI exit code policy should `specable check` use? → A: Exit `0` when no Active validation failures; exit `1` on Active validation failures or broken references; exit `2` on usage/runtime/decode errors; integrity warnings alone (duplicate names, likely duplicates, advisory flags) never fail exit.
- Q: What fixture file encoding should v0 graph projects use? → A: **JSON only** for primitive type files and optional project metadata—not YAML. v0 loader, bundled examples, and documentation MUST use JSON fixtures exclusively.

### Session 2026-06-23

- Q: Which v0 relationship rules should validation enforce as required vs optional? → A: Use the canonical Product Primitives ontology from Notion without a reduced divergent model. Status-aware strictness: Draft → incomplete relationships reported as warnings; Active → required relationship rules enforced as validation failures; Deprecated → exempt from current completeness unless referenced by Active primitives. Enforce the nine-type ontology and per-type Active rules documented in Functional Requirements (Story, Capability, Capability Concept Link, Workflow, Persona, Expected Result, Objective, Actor, Domain Concept).
- Q: How should local primitive fixtures be organized in a graph project folder? → A: One file per primitive type (e.g., `objectives.yaml`, `actors.yaml`, `stories.yaml`) plus optional project metadata.
- Q: What should the default CLI experience be when a user runs the primary command against a graph project? → A: One primary command runs validation, integrity reporting, and summary generation by default; flags such as `--validate-only`, `--integrity-only`, or `--summary-only` limit output.
- Q: When an Active Story has complete links but no stored story text, what should v0 do? → A: Auto-generate deterministic story text for validation and summary using template `As a {Actor}, I can {Capability} so that {Expected Result}.`; complete Actor + Capability + Expected Result + Workflow links suffice for Active validity; prefer stored text in summary when present; mark generated text as generated in structured/metadata output; stored text differing from generated passes with optional future strict-consistency warning.
- Q: Where should the default `check` command write its outputs? → A: Stdout by default for interactive use (validation status, integrity findings, short summary preview); no files written unless `--out <dir>` is passed, which writes `summary.md`, `validation.json`, `integrity-report.json`, optional `integrity-report.md`, and optional combined `check-result.json`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate a Local Primitive Graph (Priority: P1)

A product owner or engineer maintains product intent as structured primitive fixture files in a local project folder. They run a command against that folder to confirm every primitive has required fields, stable identifiers, valid structure, and—where marked Active—satisfies canonical relationship rules before sharing or generating artifacts.

**Why this priority**: Validation is the minimum viable entry point. Without trustworthy structural checks, relationship reports and summaries would amplify bad data instead of clarifying product state.

**Independent Test**: Point the tool at a fixture folder containing a mix of valid, Draft, Active, and Deprecated primitives; confirm the tool reports pass/fail per primitive type, distinguishes warnings (Draft incompleteness) from failures (Active incompleteness), lists missing required fields and relationships with stable IDs, exits `0` only when no Active validation failures or broken references are present, and completes without network access or external services.

**Acceptance Scenarios**:

1. **Given** a fixture folder with all Active primitives satisfying required fields and canonical relationships, **When** the user runs validation, **Then** the tool reports success and confirms each supported primitive type was checked.
2. **Given** a Draft primitive missing a required Active relationship, **When** the user runs validation, **Then** the tool reports a warning (not a hard failure) identifying primitive ID, type, and missing relationship.
3. **Given** an Active primitive missing a required field or canonical relationship, **When** the user runs validation, **Then** the tool reports a validation failure with primitive ID, type, field or relationship name, and a human-readable error without modifying source files.
4. **Given** a fixture folder with invalid references to unknown primitive IDs, **When** the user runs validation, **Then** the tool reports broken references as validation failures distinct from missing required fields.
5. **Given** no network connectivity and no third-party credentials, **When** the user runs validation on local fixtures, **Then** the tool completes successfully using only local files.
6. **Given** a graph with integrity warnings only (e.g., duplicate normalized names, likely duplicates, Draft incompleteness) and zero Active validation failures, **When** the user runs the default check command, **Then** the process exits with code `0`.
7. **Given** a graph with one or more Active validation failures or broken references, **When** the user runs the default check command, **Then** the process exits with code `1`.

---

### User Story 2 - Inspect Graph Relationship Integrity (Priority: P2)

After structural validation, the user needs to understand whether the primitive graph is connected and coherent: missing expected links, orphaned primitives, broken references, duplicate story triples, and duplicate or likely-duplicate entries—applying canonical Notion ontology rules with status-aware severity.

**Why this priority**: A structurally valid graph can still fail to express product meaning. Relationship integrity reporting surfaces modeling gaps before anyone trusts generated summaries.

**Independent Test**: Run the integrity report against fixtures engineered to include an Active capability without workflow membership, a persona without evidence, a duplicate Story triple (same Actor + Capability + Expected Result), and two capabilities with the same normalized name; confirm each issue appears in the report with enough context to fix the graph.

**Acceptance Scenarios**:

1. **Given** a graph where a persona references a missing actor ID, **When** the user requests a relationship integrity report, **Then** the report lists the broken reference with source primitive, relationship type, and target ID.
2. **Given** Active primitives with no inbound or outbound relationships where canonical rules require them, **When** the user requests the report, **Then** under-linked Active primitives are listed as failures and under-linked Draft primitives as warnings.
3. **Given** two Active stories sharing the same Actor, Capability, and Expected Result triple, **When** the user requests the report, **Then** the report flags duplicate Story triples and identifies the conflicting story IDs.
4. **Given** two capabilities with the same normalized name in one graph, **When** the user requests the report, **Then** the report flags duplicate names as integrity **warnings** (not failures), identifies the conflicting primitive IDs, and does not alone cause a non-zero CLI exit code.
5. **Given** a Deprecated primitive with incomplete relationships not referenced by any Active primitive, **When** the user requests the report, **Then** completeness rules are not enforced against that Deprecated primitive.

---

### User Story 3 - Generate a Human-Readable Product Summary (Priority: P3)

A stakeholder runs a command on a graph to produce a Markdown summary that explains the current product model in plain language, emphasizing Active primitives, including derived stories and explicit modeling gaps.

**Why this priority**: The constitution requires human-facing artifacts. The summary proves the primitive graph communicates product state better than prose-only documents scattered across tools.

**Independent Test**: Generate a summary from a small valid fixture graph; confirm the Markdown includes all required sections, derived stories trace to actor-capability-expected-result relationships, Active/Draft/Deprecated status is reflected appropriately, and gap sections appear when integrity issues exist.

**Acceptance Scenarios**:

1. **Given** a valid graph with Active objectives, workflows, actors, personas, capabilities, domain concepts, capability concept links, and expected results, **When** the user runs the default check command, **Then** stdout includes a short summary preview with sections for active objectives, workflows, actors/personas, capabilities, domain concepts, expected results, derived stories, and known modeling gaps; **When** `--out` is supplied, **Then** `summary.md` in the output directory contains the full Markdown summary.
2. **Given** a graph where Active stories are derived from Actor, Capability, and Expected Result relationships, **When** the user generates a summary, **Then** derived stories appear with story text and cite contributing primitive IDs or names.
3. **Given** a graph with known integrity or validation issues, **When** the user generates a summary, **Then** the output includes a "known modeling gaps" section listing unresolved issues rather than inventing missing product meaning.
4. **Given** the same graph fixture run twice without changes, **When** the user generates a summary both times, **Then** the Markdown output is deterministic (same section order and content aside from timestamps if explicitly included).

---

### User Story 4 - Learn the Model from Example Graphs (Priority: P4)

A new user opens bundled example primitive graphs to understand how to model product intent using the canonical Product Primitives ontology without reading internal company documentation.

**Why this priority**: Examples reduce adoption friction and demonstrate correct versus incorrect modeling patterns aligned with v0 scope.

**Independent Test**: Run validation, integrity reporting, and summary generation against each bundled example without additional setup; confirm the generic example stands alone and the CoachBridge-inspired example uses only synthetic fake data.

**Acceptance Scenarios**:

1. **Given** the bundled generic example graph, **When** a new user validates and generates a summary, **Then** they can understand the primitive types, status values, and canonical relationships without Pathable- or CoachBridge-specific context.
2. **Given** the bundled CoachBridge-inspired synthetic example, **When** a user inspects the fixtures, **Then** all names and data are fictional and no real customer or internal Notion content is required.
3. **Given** an example graph intentionally modeling common mistakes (Draft vs Active violations, duplicate story triple, missing capability concept link), **When** the user runs validation and integrity reporting, **Then** the tool demonstrates useful warning and failure output the user can compare against a corrected variant if provided.

---

### Edge Cases

- **Empty or missing fixture folder**: Validation fails with a clear error identifying missing project root or expected primitive type files; no summary is generated.
- **Invalid JSON fixture**: Fixture decode errors (malformed JSON, schema decode failure) MUST fail with exit code `2` and report file path plus field path; no summary is generated.
- **Missing primitive type file**: Treated as an empty collection for that type (zero primitives); validation proceeds and reports under-linked Active primitives or missing references accordingly.
- **Duplicate stable IDs**: Duplicate IDs within a graph project are validation failures regardless of status. Uniqueness is enforced at the storage/repository boundary during load (file-backed loaders fail on the first duplicate, analogous to SQL unique constraints); the CLI maps storage duplicate errors to `duplicate-id` validation failures with exit code `1`.
- **Duplicate normalized names**: Same normalized display name within a primitive type (e.g., two Active capabilities named "Schedule Session") are integrity **warnings**, not validation or integrity failures; they appear in the integrity report and gap sections but do not alone fail `check` or force exit code `1`.
- **Authored vs derived story conflict**: Two Active stories with the same Actor + Capability + Expected Result triple are flagged as duplicate Story triples (`duplicate-story-triple` failures in `validation.json`; `duplicateStoryTriples` summary in `integrity-report.json`). Stored text differing from generated template text is allowed and passes validation; optional future mode may warn on inconsistency.
- **Optional descriptive fields empty**: Allowed for Draft primitives (warn if Active-relevant); Active primitives fail required-field validation when mandatory descriptive fields are absent.
- **Circular workflow references**: Allowed if references resolve; integrity report warns on redundant cycles but does not fail unless Active completeness rules are violated.
- **Summary on partially invalid graphs**: Summary generation is permitted; output MUST include prominent gap sections. Active validation failures MUST be listed in gaps; Draft warnings SHOULD be listed separately from Active failures.
- **Deprecated primitives referenced by Active graph**: Deprecated targets remain valid reference targets; Deprecated sources must not block Active validation unless an Active primitive depends on an incomplete Deprecated chain incorrectly marked Active.
- **CLI exit codes**: Exit `0` when no Active validation failures or broken references; exit `1` on Active validation failures or broken references; exit `2` on usage, runtime, or fixture decode errors. Integrity warnings alone (duplicate names, likely duplicates, advisory quality flags, Draft incompleteness) MUST NOT cause exit `1`.

## Requirements *(mandatory)*

### Functional Requirements

**Scope and architecture**

- **FR-001**: The release MUST model product intent using the canonical Product Primitives ontology without a reduced divergent relationship model. Supported v0 types: Objective, Actor, Persona, Domain Concept, Capability, Capability Concept Link, Expected Result, Workflow, and Story.
- **FR-056**: Domain primitive schemas, closed-set value types (e.g., `status`, actor category, concept role/importance, persona confidence), reference types, and domain-level tagged errors MUST live in a dedicated workspace package (`@specable/domain`). `@specable/cli` MUST depend on `@specable/domain` for domain types. Graph types (`ProductGraph`, indexes), loaders, status-aware validation engines, integrity analysis, summary generation, and CLI/I/O adapters MUST remain in `@specable/cli` or other downstream packages—not in `@specable/domain`.
- **FR-057**: All closed-set domain values MUST be defined as Effect Schema literal unions, not native TypeScript `enum` declarations. Schema union types are the canonical representation for enumerated domain fields.
- **FR-058**: `@specable/domain` MUST encode semantic meaning and field-level constraints using Effect Schema annotations and built-in Schema validation features to the fullest practical extent. The only executable logic in `@specable/domain` is that provided by Effect Schema (decode, encode, filters, refinements, annotations). Cross-primitive graph rules, status-aware severity, integrity analysis, derivation, and artifact generation MUST be implemented in downstream packages that consume `@specable/domain` schemas.
- **FR-059**: `@specable/domain` test coverage MUST be minimal—limited to verifying encode/decode behavior for complex or non-obvious schema compositions. Comprehensive validation, graph traversal, integrity, summary, and CLI behavior tests MUST live in consuming packages (primarily `@specable/cli`).
- **FR-002**: The primitive graph MUST be the source of truth; Stories, summaries, PRDs, tickets, and handoff documents MUST be treated as outputs or communication artifacts, not authoritative inputs.
- **FR-003**: The core library MUST operate on local fixture files without requiring Notion, Confluence, Linear, Jira, GitHub, Figma, MCP, cloud hosting, authentication, or write-back automation at runtime. Canonical relationship rules are sourced from the Notion Product Primitives ontology definition but encoded locally for offline validation.
- **FR-004**: Product Experience Context, Design Impact Review, design artifacts, Figma handoff, roadmap generation, vertical slice planning, and implementation task generation MUST be out of scope for this release (MAY be referenced only as future extensions).

**Primitive status and validation strictness**

- **FR-005**: Every primitive MUST carry a `status` of `Draft`, `Active`, or `Deprecated`.
- **FR-006**: For `Draft` primitives, validation MUST report missing required fields and missing canonical relationships as **warnings**, not hard failures.
- **FR-007**: For `Active` primitives, validation MUST enforce all required fields and canonical relationship rules documented below; violations MUST be **validation failures**.
- **FR-008**: For `Deprecated` primitives, validation MUST NOT enforce current completeness rules unless the Deprecated primitive is required to satisfy Active primitive relationships (i.e., Deprecated may be referenced for history without full Active completeness).
- **FR-009**: Validation output MUST distinguish warnings (Draft incompleteness, per-primitive advisory quality flags per FR-013–FR-026) from failures (Active incompleteness, broken references, duplicate IDs, duplicate Active story triples). Per-primitive advisories appear in `validation.json`; cross-primitive graph heuristics (e.g., duplicate names, orphans, workflow derivability per FR-016) appear in `integrity-report.json`.

**Canonical relationship rules (Active primitives)**

*Story* — derived human-readable planning artifact:

- **FR-010**: Active Story MUST have exactly one Actor, exactly one Capability, exactly one Expected Result, at least one Workflow, and generated or stored story text. Canonical product meaning lives in linked primitives, not manually authored prose alone.
- **FR-010a**: When stored story text is absent but Actor, Capability, Expected Result, and Workflow links are complete, validation MUST pass by treating deterministically generated story text as satisfying the story text requirement.
- **FR-010b**: Generated story text MUST use the stable v0 template: `As a {Actor}, I can {Capability} so that {Expected Result}.` Template placeholders MUST use linked primitive display names when present and non-empty; otherwise fall back to the linked primitive IDs.
- **FR-010c**: When Workflow context is included in structured or summary output, Workflow MUST appear as metadata (e.g., `Workflow: {Workflow}`) separate from the core story sentence unless stored story text explicitly includes it.
- **FR-010d**: Active Story missing Actor, Capability, Expected Result, or Workflow links MUST fail validation. Draft Story with incomplete links MUST warn, not fail.
- **FR-010e**: Active Story with stored text that differs from generated text MUST pass validation; strict generated-text consistency checks MAY be added later as an optional warning mode, not a v0 default failure.
- **FR-011**: Validation MUST detect duplicate Story triples (same Actor + Capability + Expected Result) among Active stories and emit `duplicate-story-triple` failure findings in `validation.json`.

*Capability* — reusable operational ability:

- **FR-012**: Active Capability MUST link to at least one Actor that uses or benefits from it, at least one Expected Result it produces, at least one Workflow where it appears, and at least one Domain Concept it operates on. Domain Concept linkage is satisfied by either a direct `domainConcepts` reference or a Capability Concept Link (CCL is preferred but not required).
- **FR-013**: Validation MUST flag capabilities that appear too broad, too narrow, or implementation-specific as **warnings**, not hard failures.

*Capability Concept Link* — preferred Capability↔Domain Concept relation:

- **FR-014**: Active Capability Concept Link MUST reference exactly one Capability, exactly one Domain Concept, one role (`Reads`, `Creates`, `Updates`, `Deletes`, `References`, `Attaches`, `Summarizes`, `Approves`, or `Exports`), and one importance (`Primary`, `Secondary`, or `Supporting`).

*Workflow* — real operational sequence (not screen flow or generic business area):

- **FR-015**: Active Workflow MUST link to at least one Objective, at least one Primary Actor, at least one Capability, at least one Story, and include description or sequence notes explaining the operational sequence.
- **FR-016**: Expected Results and Domain Concepts MAY be explicit workflow relations or derived from workflow capabilities; integrity reporting MUST warn when they are missing or not derivable (cross-primitive heuristic reported in `integrity-report.json`).

*Persona* — evidence-backed context distinct from Actor:

- **FR-017**: Active Persona MUST link to at least one Primary Actor, include description/context, goals or pain points/constraints, and evidence/artifact reference unless confidence is explicitly `Hypothesis`.
- **FR-018**: Validation MUST flag personas that look like Actors or lack evidence as **warnings**.

*Expected Result* — observable changed state:

- **FR-019**: Active Expected Result MUST have a state-like name (not just a noun), definition or notes, at least one producing Capability, and at least one supported Objective.
- **FR-020**: Validation MUST warn if an Expected Result is vague, task-like, implementation-specific, or indistinguishable from a Domain Concept name.

*Objective* — why work matters:

- **FR-021**: Active Objective MUST include description, success criteria or outcome framing, and at least one related Workflow or Expected Result. Draft Objectives MAY stand alone.

*Actor* — participant in product behavior:

- **FR-022**: Active Actor MUST include description and category (`Human`, `System`, `AI`, `Organization`, or `External`).
- **FR-023**: Validation MUST warn when an Active Actor is not connected to any Workflow, Capability, Story, or Expected Result.

*Domain Concept* — semantic product/domain concept:

- **FR-024**: Active Domain Concept MUST include a definition.
- **FR-025**: Validation MUST warn when a Domain Concept has no related Capability Concept Links, no related concepts, and no evidence/artifact reference.
- **FR-026**: Validation MUST warn when a Domain Concept appears to be a database table, UI component, API payload, button label, or implementation-only detail.

**Relationships and graph behavior**

- **FR-027**: The system MUST represent typed relationships between primitives using explicit relationship kinds aligned with the canonical ontology (e.g., `persona→primaryActor`, `capabilityConceptLink→capability`, `story→actor|capability|expectedResult|workflow`, workflow membership, story derivation sources).
- **FR-028**: The system MUST support graph traversal sufficient to power validation, integrity analysis, derivative derivation (workflow-level Expected Results and Domain Concepts), and summary generation without external services.
- **FR-029**: Derived stories MUST be reproducible from graph relationships and MUST NOT introduce product meaning absent from linked primitives. Deterministic story text generation from the v0 template is the default derivation path when stored text is missing.

**Validation**

- **FR-030**: Users MUST be able to validate a graph from local fixture files via a command-line interface.
- **FR-048**: The CLI MUST expose one primary project command (e.g., `check`) that, by default, runs validation, relationship integrity reporting, and Markdown summary generation in a single invocation against a user-supplied graph project folder.
- **FR-049**: The primary CLI command MUST support flags to limit output scope, including at minimum `--validate-only`, `--integrity-only`, and `--summary-only`.
- **FR-050**: When running the default (full) command, output MUST present validation results, integrity findings, and summary content in a deterministic order without requiring manual intermediate steps.
- **FR-053**: By default (no `--out`), the CLI MUST print validation status, integrity findings, and a short summary preview to stdout and MUST NOT write files.
- **FR-054**: When `--out <dir>` is provided, the CLI MUST write shareable artifacts to that directory, including at minimum `summary.md`, `validation.json`, and `integrity-report.json`; it MAY also write `integrity-report.md` and a combined `check-result.json` for machine-readable consumption.
- **FR-055**: File writes MUST occur only when `--out` is explicitly supplied; the default command MUST remain suitable for interactive fixture authoring and CI stdout inspection.
- **FR-060**: The primary CLI command MUST use deterministic exit codes: `0` when no Active validation failures or broken references are present; `1` when one or more Active validation failures or broken references are present; `2` for usage errors, missing project directory, or fixture decode failures. Integrity warnings alone—including duplicate normalized names, likely duplicates, Draft incompleteness, and advisory quality flags—MUST NOT cause exit `1`.
- **FR-031**: Validation MUST report required-field and relationship compliance with status-aware severity (warnings vs failures per FR-006 through FR-009).
- **FR-032**: Validation MUST detect broken references to unknown primitive IDs and report them as failures distinct from missing required relationships.

**Relationship integrity reporting**

- **FR-033**: Users MUST be able to obtain a relationship integrity report from the command line for a local graph.
- **FR-034**: The integrity report MUST consolidate missing canonical links, orphans, broken references, duplicate names within a primitive type, likely duplicates, and cross-primitive advisory quality warnings (e.g., workflow derivation gaps per FR-016) with status-aware severity. Duplicate Active story triple **failures** are owned by validation (`validation.json` per FR-011); the integrity report includes a `duplicateStoryTriples` summary section for fix-up context.
- **FR-034a**: Duplicate normalized names within a primitive type MUST be reported as integrity **warnings**, not validation failures or integrity failures. Duplicate names alone MUST NOT cause a non-zero CLI exit code.
- **FR-035**: When information needed to infer product meaning is absent, the system MUST report the gap explicitly instead of silently assuming defaults that invent intent.

**Summary generation**

- **FR-036**: Users MUST be able to generate a Markdown product primitive summary from a local graph via the command line.
- **FR-037**: The summary MUST include sections for active objectives, workflows, actors/personas, capabilities, domain concepts (including capability concept links where relevant), expected results, derived stories, and known modeling gaps when applicable.
- **FR-038**: Summary generation MUST be deterministic for an unchanged graph input.
- **FR-039**: The summary MUST surface modeling gaps from validation and integrity findings rather than omitting or fabricating missing sections; Active failures and Draft warnings MUST be visually distinguishable in gap reporting.
- **FR-051**: Summary generation MUST prefer stored story text when present; otherwise MUST use deterministic generated story text from the v0 template.
- **FR-052**: Structured summary or CLI metadata output MUST indicate when story text was generated rather than stored; human-facing Markdown prose MAY omit an explicit "generated" label if traceability is preserved in structured output.

**Examples and usability**

- **FR-040**: The release MUST ship at least two example graphs: (a) a small generic example not tied to Pathable or CoachBridge, and (b) a small synthetic CoachBridge-inspired example using fake data only.
- **FR-041**: Example graphs MUST include at least one intentionally imperfect variant or documented mistake pattern demonstrating Draft warnings, Active failures, and advisory warnings.
- **FR-042**: Users MUST be able to create and edit local primitive fixture files using documented fixture conventions shipped with the release.
- **FR-045**: A graph project folder MUST store primitives as **one JSON file per primitive type** (e.g., `objectives.json`, `actors.json`, `personas.json`, `domain-concepts.json`, `capabilities.json`, `capability-concept-links.json`, `expected-results.json`, `workflows.json`, `stories.json`); exact filenames MAY vary but MUST be documented, use the `.json` extension, and remain consistent within a project.
- **FR-046**: A graph project MAY include optional project metadata (e.g., graph name, version, schema version) in a small root metadata JSON file separate from primitive type files.
- **FR-061**: v0 graph project fixtures MUST use **JSON encoding only** for primitive type files and optional project metadata. YAML fixture input is out of scope for v0; the loader MUST NOT require or discover YAML primitive files. Bundled examples and shipped fixture documentation MUST use JSON.
- **FR-047**: The CLI and library MUST discover and load all primitive type files from a user-supplied project folder without requiring a Notion or hosted service connection.

**Quality attributes (user-visible)**

- **FR-043**: Error, warning, and gap messages MUST be actionable for a product owner or engineer fixing the graph without reading source code.
- **FR-044**: The release MUST demonstrate correct, incorrect, Draft, Active, and Deprecated graph handling using synthetic fixtures in automated checks bundled with the project.

### Key Entities

- **Objective**: Why work matters; Active requires description, success framing, and workflow or expected-result linkage.
- **Actor**: Participant with category (`Human`, `System`, `AI`, `Organization`, `External`); may exist before all relationships are known.
- **Persona**: Evidence-backed archetype distinct from Actor; links to Primary Actor(s) with goals, constraints, and evidence unless `Hypothesis`.
- **Domain Concept**: Semantic domain vocabulary item with definition; quality warnings for implementation-shaped or unlinked concepts.
- **Capability**: Reusable operational ability linking actors, expected results, workflows, and domain concepts.
- **Capability Concept Link**: Typed join between Capability and Domain Concept with role and importance.
- **Expected Result**: Observable changed state with producing capabilities and supported objectives.
- **Workflow**: Operational sequence linking objectives, primary actors, capabilities, and stories with sequence notes.
- **Story**: Human-readable derived planning artifact from Actor + Capability + Expected Result (+ Workflow membership). Stored text preferred in summaries; otherwise deterministic template text satisfies Active validation.
- **Primitive status**: `Draft` | `Active` | `Deprecated` (Schema literal union); controls validation strictness.
- **Relationship edge**: Typed link between primitives per canonical ontology; carries integrity and derivation rules.
- **Validation finding**: Structured issue with severity (`warning` | `failure`) for fields, relationships, broken references, duplicate IDs, duplicate Active story triples, or per-primitive advisory quality flags (FR-013–FR-026) on a specific primitive ID; emitted in `validation.json`.
- **Integrity finding**: Structured issue for cross-primitive graph heuristics—missing links, orphans, duplicate normalized names (warning), likely duplicates (warning), workflow derivation gaps (FR-016), and related graph-level advisories; emitted in `integrity-report.json`. Duplicate Active story triple failures are validation findings; integrity output includes a `duplicateStoryTriples` summary only.
- **Product summary artifact**: Generated Markdown derived from graph state and findings; not canonical.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create or edit a complete v0 graph using only local JSON fixture files and project documentation, with no external accounts or network services.
- **SC-002**: Running validation on the bundled generic example (Active-valid variant) completes in under 5 seconds on a typical developer laptop and reports zero Active failures.
- **SC-003**: For engineered invalid fixtures, at least 95% of injected issues (missing Active relationship, broken reference, duplicate story triple, duplicate name, advisory quality flag) appear in validation or integrity output with the correct primitive ID cited and correct severity (warning vs failure).
- **SC-004**: A user can run the primary CLI command against a fixture folder and receive validation status and integrity findings on stdout plus a short summary preview in one invocation; `--out <dir>` writes `summary.md` and structured JSON reports for sharing. Scoped flags allow validate-only, integrity-only, or summary-only runs without a separate manual pipeline. Exit code `0` indicates no Active validation failures or broken references; exit `1` indicates Active failures or broken references; integrity warnings alone do not fail exit.
- **SC-005**: Generated summaries for the generic example allow a new reviewer to correctly identify at least four primitive types, two canonical relationships, and Draft vs Active status behavior without prior SpecAble training, verified by a short comprehension checklist in project docs.
- **SC-006**: Every Active story represented in a summary has exactly one Actor, one Capability, and one Expected Result in the graph. Summary story text is either stored or deterministically generated from those links using the v0 template; no story text appears when any required link is missing.
- **SC-007**: Re-running summary generation on an unchanged graph produces byte-identical Markdown output (excluding optional timestamp metadata if the product chooses to include it, which MUST be off by default).
- **SC-008**: Both bundled examples validate and summarize successfully offline; the CoachBridge-inspired example contains zero references requiring real Pathable internal documentation or production data.
- **SC-009**: Validation correctly applies zero Active failures to Deprecated-only completeness gaps while still failing Active primitives that violate canonical rules.

## Assumptions

- Primary users are product owners, product engineers, and technical writers modeling intent locally before any Notion or PM tool adapters exist.
- Phase 2 foundational work introduces `@specable/domain` as a separate workspace package for domain models; `@specable/cli` consumes it. Closed-set fields use Effect Schema literal unions exclusively—native TypeScript `enum` is not used.
- `@specable/domain` is schema-only: semantic meaning and field constraints are expressed via Effect Schema annotations and built-in validation; graph loading, status-aware rules, integrity, and summaries are downstream concerns.
- `@specable/domain` carries minimal tests (complex encode/decode cases only); behavioral test suites belong in `@specable/cli`.
- Canonical relationship rules match the Notion Product Primitives ontology; v0 encodes those rules locally—Notion is a specification source, not a runtime dependency.
- Fixture files use **JSON only** in a graph project folder with **one file per primitive type** plus optional project metadata; exact filenames and metadata schema will be defined during planning but MUST remain storage-provider agnostic. YAML fixture input is explicitly out of scope for v0.
- Stable IDs are globally unique strings within a graph project; duplicate IDs are validation failures enforced at the storage/repository boundary (loaders fail on first duplicate; CLI maps to exit `1`).
- Exact duplicate normalized names within a primitive type are integrity **warnings** (not failures); "likely duplicate" detection uses normalized name equality as a baseline, with optional fuzzy similarity for same-type pairs sharing significant token overlap—also reported as warnings.
- Summary generation on graphs with Active validation failures is allowed; output MUST prominently list gaps and MUST NOT fabricate missing primitive content.
- Command-line interaction is the only required user interface for v0; graphical UI, MCP tools, and hosted services are explicitly deferred.
- `specable check` exit codes: `0` = no Active validation failures or broken references; `1` = Active validation failures or broken references present; `2` = usage/runtime/decode errors. Integrity warnings alone never fail exit.
- Licensing and open-source distribution details are handled outside this feature spec but MUST NOT contradict local-first operation.

## Out of Scope (v0)

- YAML fixture input (v0 uses JSON-only graph project files; YAML adapters deferred)
- Notion, Confluence, Linear, Jira, GitHub, Figma, or any hosted storage adapter at runtime
- MCP server exposure, cloud hosting, authentication, or multi-user permissions
- Write-back automation to external systems
- Product Experience Context, Design Impact Review, design artifacts, Figma handoff
- Roadmap generation, vertical slice planning, implementation task generation
- Full PM suite features or replacement for existing documentation tools
