# Research: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Date**: 2026-06-23 (updated 2026-06-24)

## R1 — Monorepo layout for v0

**Decision**: Two workspace packages: `@specable/domain` at `packages/domain` (primitive schemas, Schema literal unions, references, domain decode errors) and `@specable/cli` at `packages/cli` (graph, validation, integrity, summary, CLI). CLI depends on domain.

**Rationale**: Clarified in spec session 2026-06-24 (FR-056). Aligns with constitution Principle V (library-first). Domain schemas are reusable by future MCP adapters without coupling to CLI/I/O. Phase 1 bootstrap used a single CLI package; Phase 2 adds the domain package before foundational schema work.

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

**Decision**: `@effect/schema` (Effect Schema) for all primitive types, closed-set values, relationship payloads, CLI output DTOs, and fixture decoding. Closed-set domain values use `Schema.Literal` unions — native TypeScript `enum` is prohibited (FR-057). Semantic meaning and field-level validation use Schema annotations and built-in filters/refinements wherever practical (FR-058).

**Rationale**: Constitution requires explicit schemas; Effect Schema integrates with tagged errors and `@effect/cli` decoding. Annotation-first approach keeps validation logic in Schema for simple constraints; cross-primitive rules stay in `@specable/cli`.

**Alternatives considered**:
- Zod only — acceptable per constitution but splits validation stack away from Effect errors/services.
- Native TypeScript `enum` — rejected; Schema literal unions are preferred for decode/encode symmetry and annotation support.

## R4 — Fixture serialization format

**Decision**: YAML for human-authored graph fixtures; JSON for machine-written CLI artifacts (`validation.json`, `integrity-report.json`, `check-result.json`).

**Rationale**: Spec assumes human-editable structured files; YAML is easier for product owners. JSON outputs are stable for CI and tooling.

**Alternatives considered**:
- JSON fixtures only — rejected; worse authoring ergonomics for examples.
- TOML — rejected; less common in product/engineering docs tooling.

## R5 — Fixture file layout

**Decision**: One file per primitive type plus optional `graph.yaml` metadata, using documented canonical filenames under a graph project directory.

**Rationale**: Clarified in spec session 2026-06-23 (Option B).

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

## R10 — Likely duplicate detection

**Decision**: v0 baseline uses normalized exact name match within a primitive type; token-overlap similarity (Jaccard ≥ 0.8 on normalized word tokens) flags “likely duplicate” warnings only.

**Rationale**: Spec assumption; keeps behavior deterministic and testable without ML.

**Alternatives considered**:
- Levenshtein-only — rejected; noisier on short names.

## R11 — Workflow derivability for Expected Results / Domain Concepts

**Decision**: Derive workflow-level Expected Results and Domain Concepts by traversing linked Capabilities and their Capability Concept Links and Expected Result edges. If none derivable, emit integrity **warning** for Active workflows (not hard failure unless explicit relations also missing and derivation empty).

**Rationale**: FR-016 allows explicit or derived relations; derivation reduces fixture burden while still surfacing gaps.

## R12 — Package exports/codegen

**Decision**: Use `@effect/build-utils` `prepare-v2` / `pack-v2` pipeline with generated `index.ts` exports in **both** `@specable/domain` and `@specable/cli`. Domain exports schemas and inferred types only; CLI exports graph/validation/summary modules and excludes `bin.ts`.

**Rationale**: Template convention; prevents manual export drift. Domain package is independently versioned/publishable for agent and library consumers.

## R13 — Domain package scope boundary

**Decision**: `@specable/domain` contains primitive schemas, Schema literal unions (`packages/domain/src/unions/`), `Reference`, `PrimitiveBase`, nine primitive schemas, and `FixtureDecodeError`. No graph types, loaders, validation engines, or Node platform imports.

**Rationale**: FR-056, FR-058. Only logic embedded in Effect Schema lives in domain; downstream packages consume decoded types.

**Alternatives considered**:
- Include `ProductGraph` in domain — rejected; graph indexing is not a domain model concern.
- Include validation rules in domain — rejected; status-aware cross-primitive rules exceed Schema-only boundary.

## R14 — Domain package testing

**Decision**: Minimal tests in `@specable/domain` — encode/decode round-trips for complex or non-obvious schema compositions only. Comprehensive behavioral tests in `@specable/cli`.

**Rationale**: FR-059. Domain package is declarative; behavioral coverage belongs with consuming packages.
