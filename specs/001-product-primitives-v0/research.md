# Research: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Date**: 2026-06-23 (updated 2026-06-25 — integrity heuristics, artifact split)

## R1 — Monorepo layout for v0

**Decision**: Two workspace packages: `@specable/domain` at `packages/domain` (primitive schemas, Schema literal unions, references, domain decode errors) and `@specable/cli` at `packages/cli` (graph, validation, integrity, summary, CLI). CLI depends on domain.

**Rationale**: Clarified in spec session 2026-06-24 (AC-001 in plan.md). Aligns with constitution Principle V (library-first).

**Alternatives considered**:
- Single `@specable/cli` with internal `domain/` module — rejected after 2026-06-24 clarification; deferred extraction no longer matches spec.
- Three+ packages (domain + graph + cli) — rejected; graph and validation are not independently published in v0.

## R2 — Effect ecosystem and tooling

**Decision**: Adopt Effect v3 stack from the template: `effect`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@effect/eslint-plugin`, `@effect/language-service`, `@effect/build-utils`.

**Rationale**: Constitution prefers Effect for services, config, and errors. User explicitly requested template alignment. `@effect/cli` matches the primary `check` command model; platform-node provides filesystem services for local fixture loading.

**Alternatives considered**:
- Commander + Zod — rejected; diverges from template and Effect service model.
- Separate vitest without `@effect/vitest` — rejected; worse ergonomics for Effect program tests.

## R3 — Schema system

**Decision**: `@effect/schema` (Effect Schema) for all primitive types, closed-set values, relationship payloads, CLI output DTOs, and fixture decoding. Closed-set domain values use `Schema.Literal` unions — native TypeScript `enum` is prohibited (AC-002). Semantic meaning and field-level validation use Schema annotations and built-in filters/refinements wherever practical (AC-003).

**Rationale**: Constitution requires explicit schemas; Effect Schema integrates with tagged errors and `@effect/cli` decoding. Annotation-first approach keeps validation logic in Schema for simple constraints; cross-primitive rules stay in `@specable/cli`.

**Alternatives considered**:
- Zod only — acceptable per constitution but splits validation stack away from Effect errors/services.
- Native TypeScript `enum` — rejected; Schema literal unions are preferred for decode/encode symmetry and annotation support.

## R4 — Fixture serialization format

**Decision**: **JSON only** for human-authored graph project fixtures (one file per primitive type plus optional `graph.json` metadata). JSON for machine-written CLI artifacts (`validation.json`, `integrity-report.json`, `check-result.json`). YAML fixture input is out of scope for v0 (FR-061).

**Rationale**: Clarified in spec session 2026-06-24 — JSON preferred for v0 first version; avoids an extra YAML parser dependency at the loader boundary; aligns with structured CI tooling and native Node `JSON.parse`.

**Alternatives considered**:
- YAML fixtures — rejected in 2026-06-24 clarification; previously assumed for authoring ergonomics.
- Both YAML and JSON — rejected; v0 standardizes on one input format.
- TOML — rejected; less common in product/engineering docs tooling.

## R5 — Fixture file layout

**Decision**: One JSON file per primitive type plus optional `graph.json` metadata, using documented canonical filenames under a graph project directory.

**Rationale**: Clarified in spec session 2026-06-23 (layout); filenames updated to `.json` in session 2026-06-24.

**Alternatives considered**:
- Single combined graph file — rejected during clarification.

## R6 — Primary Actor representation

**Decision**: Model `Primary Actor` as a relationship role on Actor links from Persona and Workflow (field `role: "Primary" | "Supporting" | ...` on typed reference objects), not a separate primitive type.

**Rationale**: Matches Notion ontology intent while keeping Actor as the canonical node type. Workflow rule “at least one Primary Actor” validates link role metadata.

**Alternatives considered**:
- Separate `PrimaryActor` pseudo-type — rejected; duplicates Actor entity.

## R7 — CLI command surface

**Decision**: Executable `specable` with primary subcommand `check <projectDir>` using `@effect/cli`. Default runs validate + integrity + summary preview to stdout. Flags: `--validate-only`, `--integrity-only`, `--summary-only`, `--out <dir>`.

**Rationale**: Spec clarifications Q3 and Q5. `@effect/cli` supports composable commands and typed options.

**Alternatives considered**:
- Three top-level commands without default aggregation — rejected by SC-004.

## R8 — Typecheck script naming

**Decision**: Root `pnpm check` runs `tsc -b tsconfig.json` (template convention). Add `pnpm typecheck` as an alias to the same command.

**Rationale**: User prefers template `check`; alias avoids confusion for contributors expecting `typecheck`.

## R9 — Publishing and CI extras

**Decision**: Include Changesets config and release workflow for public OSS publishing of `@specable/domain` and `@specable/cli`. Include snapshot workflow file gated to skip gracefully when pkg.pr.new app is not installed (template pattern). Include Fallow audit workflow scoped to `packages/domain` and `packages/cli`.

**Rationale**: User requested release boilerplate for OSS v0; snapshot is optional until GitHub app is configured.

**Alternatives considered**:
- No Changesets until v0.1 — rejected; harder to retrofits publishing metadata.

## R10 — Name normalization and likely duplicate detection

**Decision**: Duplicate normalized names within a primitive type use **trim + lowercase** on the full display name; internal spacing and punctuation are preserved (e.g., `"Schedule  Session"` ≠ `"Schedule Session"`). Exact normalized matches are integrity **warnings** only (FR-034a). Likely duplicates use **Jaccard similarity ≥ 0.8** on word tokens (whitespace-split after trim+lowercase); also integrity **warnings** only.

**Rationale**: Clarified in spec session 2026-06-25. Deterministic, testable heuristics without ML; trim+lowercase matches emerging validation code patterns.

**Alternatives considered**:
- Collapse internal whitespace — rejected; spec preserves punctuation/spacing distinctions.
- Levenshtein-only fuzzy match — rejected; noisier on short names.
- Unicode NFKC normalization — deferred; v0 ASCII-focused product names sufficient.

## R10a — Duplicate normalized name severity

**Decision**: Exact duplicate normalized names within a primitive type are integrity **warnings** only (FR-034a). They appear in integrity output and gap sections but do not alone cause validation failure or CLI exit code `1`.

**Rationale**: Clarified in spec session 2026-06-24. Aligns with advisory duplicate/likely-duplicate pattern and CI-friendly exit semantics (FR-060).

**Alternatives considered**:
- Integrity failure with exit `1` — rejected; too noisy for in-progress graphs.
- Validation failure — rejected; duplicate names are modeling quality signals, not structural invalidity like duplicate IDs.

## R11 — Workflow derivability for Expected Results / Domain Concepts

**Decision**: A workflow's Expected Results and Domain Concepts are **derivable** when traversing its linked Capabilities yields ≥1 Expected Result (via capability `expectedResults` refs) and ≥1 Domain Concept (via capability `domainConcepts` refs or Capability Concept Links). If not derivable and not explicitly populated on the workflow, emit integrity warning `missing-workflow-derivation` (not a validation failure).

**Rationale**: FR-016 clarified in spec session 2026-06-25; reduces fixture burden while surfacing modeling gaps.

**Alternatives considered**:
- Require explicit workflow fields only — rejected; contradicts FR-016 derived-relation allowance.
- Story-centric derivation — rejected; capabilities are the canonical workflow membership source.

## R12 — Package exports/codegen

**Decision**: Use `@effect/build-utils` `prepare-v2` / `pack-v2` pipeline with generated `index.ts` exports in **both** `@specable/domain` and `@specable/cli`. Domain exports schemas and inferred types only; CLI exports graph/validation/summary modules and excludes `bin.ts`.

**Rationale**: Template convention; prevents manual export drift. Domain package is independently versioned/publishable for agent and library consumers.

## R13 — Domain package scope boundary

**Decision**: `@specable/domain` contains primitive schemas, Schema literal unions (`packages/domain/src/unions/`), `Reference`, `PrimitiveBase`, nine primitive schemas, and `FixtureDecodeError`. No graph types, loaders, validation engines, or Node platform imports.

**Rationale**: AC-001, AC-003 in plan.md. Only logic embedded in Effect Schema lives in domain; downstream packages consume decoded types.

**Alternatives considered**:
- Include `ProductGraph` in domain — rejected; graph indexing is not a domain model concern.
- Include validation rules in domain — rejected; status-aware cross-primitive rules exceed Schema-only boundary.

## R14 — Domain package testing

**Decision**: Minimal tests in `@specable/domain` — encode/decode round-trips for complex or non-obvious schema compositions only. Comprehensive behavioral tests in `@specable/cli`.

**Rationale**: AC-004 in plan.md. Domain package is declarative; behavioral coverage belongs with consuming packages.

## R15 — Schema annotations and relationship semantics

**Decision**: Effect Schema annotations in `@specable/domain` should use built-in annotation fields (`title`, `description`, `documentation`, `examples`, `identifier`) to document primitive and field semantics. Canonical relationships are represented by the primitive fields themselves (`Capability.actors`, `Workflow.capabilities`, `Story.expectedResult`, etc.), not by separate `Graph*` edge/node metadata or custom `jsonSchema` objects.

**Rationale**: Primitive fields are the durable ontology contract consumed by validation, summaries, story generation, and future MCP/adapters. A second graph-metadata model can drift from the schemas and blurs the line between domain semantics and graph/index/storage implementation. Storage backends may use SQL joins, Notion relations, Confluence links, JSON ID references, or other mechanisms; adapters translate those physical links into the same canonical primitive fields.

**Alternatives considered**:
- Custom `GraphEdge` / `GraphNode` annotation metadata — rejected because it creates a parallel relationship model without a current consumer.
- Treat all relationships as storage-adapter concerns — rejected because the physical link representation is adapter-specific, but relationship meaning is part of the shared domain ontology.

## R16 — Branded domain identifiers

**Decision**: Use `Schema.brand` for opaque semantically distinct strings, starting with canonical `PrimitiveId`. Reuse `PrimitiveId` for primitive identity and reference targets. Do not brand human-authored prose or labels (`name`, `description`, `notes`, `evidence`, `Story.text`, `tags`). Future adapter-specific identifiers must use separate adapter-layer brands (for example `NotionPageId`, `SqlRowId`, `ConfluencePageId`) and must not leak into domain schemas.

**Rationale**: Branded IDs prevent accidental mixing of opaque string domains while preserving fixture ergonomics: raw JSON strings decode into branded IDs at the schema boundary. Over-branding descriptive strings creates friction without improving semantic safety.

**Alternatives considered**:
- Leave all strings unbranded — rejected for opaque identifiers because accidental ID/string mixing is likely as adapters and graph indexing expand.
- Brand every string-like field — rejected because prose and display labels are not opaque identity domains and should remain easy to author and transform.

## R17 — CLI exit codes

**Decision**: `specable check` exit codes (FR-060): `0` = no Active validation failures or broken references; `1` = Active validation failures or broken references present; `2` = usage/runtime/fixture decode errors. Integrity warnings alone (duplicate names, likely duplicates, Draft incompleteness, advisory quality flags) never fail exit.

**Rationale**: Clarified in spec session 2026-06-24. Enables CI to gate on Active correctness while still surfacing advisory integrity findings on stdout.

**Alternatives considered**:
- Fail on any integrity failure — rejected; orphans/missing links may already surface as Active validation failures; duplicate names remain advisory.
- Strict mode failing on warnings — deferred post-v0 (`--strict`).

## R18 — TypeScript type safety (no `any`, minimal casts)

**Decision**: Library and CLI code MUST NOT use `any`. Type assertions (`as`) and unchecked casts MUST be avoided; prefer generics, Schema-inferred types, branded IDs, and closed-over helpers (for example `fixtureFile<A, I>()` with a typed `decode` closure) so heterogeneous registries stay type-safe without widening.

**Rationale**: PR review on graph loader (2026-06-25). `any` and casts hide fixture/registry bugs until runtime and erode strict-mode value. Effect Schema and generic factories cover heterogeneous per-type files without escape hatches.

**Alternatives considered**:
- `Schema<any>` + `as PrimitiveFileSchema` in fixture registry — rejected; violates strict typing without adding safety.
- Single union schema for all fixture files — rejected; loses per-file type validation aligned with fixture contract.

## R19 — Graph storage abstraction (`GraphRepository` over `GraphLoader`)

**Decision**: Expose a repository-shaped Effect service (`GraphRepository.load(projectPath) → ProductGraph`) as the consumer dependency. File-backed JSON loading (`GraphLoader`, `FileSystem`, Node platform Layers) is an implementation detail composed in `services/Layers.ts`. Validation, integrity, summary, and CLI commands MUST depend on `GraphRepository`, not on loader or filesystem modules directly.

**Rationale**: PR review (2026-06-25). JSON-on-disk is the first storage adapter, not the domain contract. Future adapters (SQL, Notion, MCP) can swap loader implementations without rewriting graph consumers.

**Alternatives considered**:
- Export `GraphLoaderLive` as the primary Layer — rejected; leaks file-backed mechanics to feature modules.
- Merge loader into CLI command — rejected; violates library-first and testability.

## R20 — Orphan primitive detection

**Decision**: Integrity reports a primitive as **orphan** only when it has zero inbound and zero outbound typed relationship edges **and** its type cannot meaningfully stand alone without relationships. Disconnected **Actors** are never orphans (valid during drafting before stories/workflows exist). **Draft Objectives** may stand alone (FR-021). Join-like types (Story, Capability Concept Link) and other relationship-dependent types without edges are orphans. Orphans are integrity **warnings**, not validation failures.

**Rationale**: Spec session 2026-06-25; the tool supports drafting graphs incrementally—unlinked Actors are expected, not errors.

**Alternatives considered**:
- Any zero-edge primitive is orphan — rejected; too noisy for drafting workflows.
- Orphan = missing canonical required relationship — rejected; overlaps validation-owned Active under-linked failures.

## R21 — Validation vs integrity artifact split

**Decision**: `validation.json` owns Active under-linked failures, broken references, duplicate IDs, duplicate Active story triples, and per-primitive advisory warnings (FR-013–FR-026). `integrity-report.json` contains integrity-specific findings only (orphans, duplicate names, likely duplicates, workflow derivability gaps, cross-primitive advisories)—**no duplicate Active validation failure entries**. `duplicateStoryTriples` in integrity output is a summary section for fix-up context; severity and exit code `1` come from validation `duplicate-story-triple` findings. `summary.md` gap sections may reference both sources.

**Rationale**: Spec session 2026-06-25; single-purpose artifacts avoid contradictory severity and simplify CI consumption.

**Alternatives considered**:
- Duplicate Active failures in both artifacts — rejected; redundant and risks severity drift.
- Integrity owns all missing-link findings — rejected; Active under-linked rules are validation failures per FR-007.

