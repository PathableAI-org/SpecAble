# Research: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Date**: 2026-06-23

## R1 — Monorepo layout for v0

**Decision**: Single publishable workspace package `@specable/cli` at `packages/cli` with internal module boundaries (`domain/`, `graph/`, `validation/`, `summary/`, `cli/`).

**Rationale**: User requested a one-package v0 workspace adapted from `PathableAI-org/effect-typescript-template`. Domain behavior remains library-testable inside the package and can split into `packages/domain` later without changing public CLI semantics.

**Alternatives considered**:
- `packages/domain` + `packages/cli` (template default) — rejected for v0 scope; adds cross-package wiring before first vertical slice is proven.
- Flat single-folder repo without workspaces — rejected; loses template CI/codegen/build conventions.

## R2 — Effect ecosystem and tooling

**Decision**: Adopt Effect v3 stack from the template: `effect`, `@effect/cli`, `@effect/platform`, `@effect/platform-node`, `@effect/vitest`, `@effect/eslint-plugin`, `@effect/language-service`, `@effect/build-utils`.

**Rationale**: Constitution prefers Effect for services, config, and errors. User explicitly requested template alignment. `@effect/cli` matches the primary `check` command model; platform-node provides filesystem services for local fixture loading.

**Alternatives considered**:
- Commander + Zod — rejected; diverges from template and Effect service model.
- Separate vitest without `@effect/vitest` — rejected; worse ergonomics for Effect program tests.

## R3 — Schema system

**Decision**: `@effect/schema` (Effect Schema) for all primitive types, relationship payloads, CLI output DTOs, and fixture decoding at the adapter boundary.

**Rationale**: Constitution requires explicit schemas; Effect Schema integrates with tagged errors and `@effect/cli` decoding. Internal graph logic operates on decoded types, not raw YAML strings.

**Alternatives considered**:
- Zod only — acceptable per constitution but splits validation stack away from Effect errors/services.

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

**Decision**: Include Changesets config and release workflow for public OSS publishing of `@specable/cli`. Include snapshot workflow file gated to skip gracefully when pkg.pr.new app is not installed (template pattern). Include Fallow audit workflow scoped to `packages/cli`.

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

**Decision**: Use `@effect/build-utils` `prepare-v2` / `pack-v2` pipeline with generated `index.ts` exports for public modules under `packages/cli/src/` (exclude `bin.ts` and internal test helpers).

**Rationale**: Template convention; prevents manual export drift.
