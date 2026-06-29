# Implementation Plan: Readable Semantic Wiki

**Branch**: `004-readable-semantic-wiki` | **Date**: 2026-06-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-readable-semantic-wiki/spec.md`

## Summary

Ratify the **semantic document model** as SpecAble's alpha wiki contract: a format-agnostic specification of how each core alpha primitive type maps to a semantic document (metadata, body, relationships, identity, provenance). Deliver reference mappings per primitive type, contract examples showing **two representation perspectives** (structured storage records from milestone 2 and human-readable prose documents), and a reviewer quickstart that validates the model without parsers or CLI wiki commands.

Technical approach: **documentation-first delivery** under `specs/004-readable-semantic-wiki/` with static contract artifacts referencing unchanged `@specable/domain` schemas. Structured-storage perspective reuses milestone 2 JSON primitive records and `specable primitive create` fixtures; human-readable perspective uses plain synthetic prose examples that satisfy the same semantic contract without prescribing frontmatter or parser syntax. No new Effect services, domain Schema changes, or CLI commands in this milestone — interpretation and adapter code belong to the next milestone.

## Technical Context

**Language/Version**: TypeScript 6.x / ES2022; Node.js 22+ (unchanged toolchain; no new runtime code required for contract ratification)

**Primary Dependencies**: `@specable/domain` (reference only — existing primitive schemas); milestone 2 `@specable/core` structured-storage fixtures as proving perspective; no new package dependencies

**Storage**: Contract examples only — JSON primitive records (perspective A) and human-readable prose documents (perspective B); no new storage backends or wiki parsers

**Testing**: Manual reviewer validation per [quickstart.md](./quickstart.md); static contract parity review across representation perspectives; automated round-trip tests explicitly deferred to later milestones

**Target Platform**: Local developer machine; ordinary text editors for human-readable examples; no network or hosted services

**Project Type**: pnpm monorepo — contract artifacts in `specs/004/`; domain schemas in `@specable/domain` unchanged; interpretation-layer services deferred

**Performance Goals**: N/A for contract ratification; reviewer can complete demo walkthrough in under 30 minutes (SC-003/SC-006)

**Constraints**: Format-agnostic contract (no Markdown frontmatter keys, Org drawers, or parser design); synthetic fixtures only; local-first; adapter-local IDs forbidden as canonical identity; eight core alpha types must have reference mappings

**Scale/Scope**: Eight primitive types × reference mappings; contract examples for ≥4 types across two perspectives; zero runtime code changes unless a minimal Schema annotation export is needed for documentation cross-links (optional, not required)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ Semantic documents encode typed primitives in metadata; body supplements; graph remains derived interpretation |
| II. Adapter-based | Is core logic free of hosted service dependencies? Are integrations adapter-only? | ✅ Contract is format-agnostic; structured storage is one proving perspective; no Notion/Confluence coupling |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ Static fixtures and prose examples; no network |
| IV. MCP-first | If agent-facing, are read/query prioritized over write-back automation? | ✅ Prepares interpreted-primitive contract for future MCP; no write-back in this slice |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ Intentional documentation slice — domain schemas referenced, not duplicated; library APIs for interpretation deferred to next milestone per spec out-of-scope |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ Reference mappings trace metadata fields to existing domain Schemas; relationship edges typed by ontology |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ Provenance contract requires structured records; missing provenance is a detectable gap |
| VIII. Vertical slice | Does this slice produce a demoable outcome? | ✅ Reviewer demo walkthrough ratifies contract with synthetic data |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ Human-readable perspective examples and quickstart |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform ambitions? | ✅ Contract ratification only; no parsers, validation engine, or MCP |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ References domain Schema validation rules; automated tests deferred per spec |
| Effect Requirements | Are service tags, Live Layer paths, composition root, and public method `R` documented? | ✅ N/A — no new services; forward map to interpretation layer documented below |

**Post-design re-check (2026-06-28)**: All gates pass. Documentation-only slice is justified: contract must precede interpretation services (next milestone). No constitution violations in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-readable-semantic-wiki/
├── plan.md                          # This file
├── research.md                      # Phase 0
├── data-model.md                    # Phase 1 — semantic document entities
├── quickstart.md                    # Phase 1 — reviewer validation guide
├── contracts/
│   ├── semantic-document-model.md   # Alpha wiki contract (normative)
│   ├── reference-mappings.md        # Per-type metadata/body/relationship maps
│   ├── representation-perspectives.md
│   └── examples/
│       ├── structured-storage/      # JSON primitive records (perspective A)
│       └── human-readable/          # Prose documents (perspective B)
└── tasks.md                         # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
SpecAble/
├── packages/
│   ├── domain/                      # @specable/domain — UNCHANGED (referenced by contract)
│   ├── core/                        # @specable/core — UNCHANGED (milestone 2 proving adapter)
│   └── cli/                         # @specable/cli — UNCHANGED (no wiki commands)
├── docs/
│   └── milestones/
│       └── readable-semantic-wiki.md   # Milestone source (link to specs/004 contract)
└── specs/004-readable-semantic-wiki/   # Primary deliverables (above)
```

**Structure Decision**: Deliver the alpha wiki contract as Spec Kit documentation and static contract examples under `specs/004-readable-semantic-wiki/`. Do not add runtime modules until the semantic interpretation layer milestone. Structured-storage examples may copy or reference existing milestone 2 synthetic primitives from `packages/cli/test/fixtures/summary/valid/` and `packages/cli/examples/` without modifying package code.

### TypeScript and service conventions

Per `.specify/memory/constitution.md` v1.3.0 and
[`.specify/memory/effect-service-patterns.md`](../../.specify/memory/effect-service-patterns.md):

- **No code changes required** for contract ratification; when interpretation-layer code lands (next milestone), follow existing `PrimitiveService` / `StorageBackend` Layer patterns.
- **Domain boundary**: Semantic document metadata MUST decode to existing domain `Primitive` schemas — no wiki-only types.
- **Adapter boundary**: Parsers and wiki I/O stay outside `@specable/domain`; contract defines what adapters must preserve, not how they parse.

### Service & Layer map

*No new Effect services or I/O boundaries in this milestone.*

| Item | Detail |
|------|--------|
| Tags introduced | **None** — deferred to semantic interpretation layer milestone |
| Live Layer modules | **None** — contract ratification only |
| Composition root | **Unchanged** — `packages/cli/src/services/Layers.ts`, `packages/cli/src/bin.ts` |
| Public method `R` | **N/A** |
| Forward reference (next milestone) | `SemanticDocumentInterpreter` (or equivalent) in `@specable/core` or `@specable/cli` will consume semantic documents at adapter boundary, decode metadata to domain `Primitive`, emit typed relationship edges; compose Live Layer at CLI/MCP entrypoint |
| Local references | `packages/domain/src/primitives/`, `packages/domain/src/PrimitiveBase.ts`, `packages/core/src/primitive/PrimitiveService.ts`, `packages/core/src/storage/StorageBackend.ts` (proving structured-storage perspective) |

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
