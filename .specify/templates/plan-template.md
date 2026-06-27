# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (see feature spec for minimum version if constrained)

**Primary Dependencies**: pnpm workspaces; Effect (services/config/errors); Zod or Effect Schema (validation)

**Storage**: Local fixtures and/or adapter-backed storage (Notion first adapter allowed; core MUST NOT depend on hosted services)

**Testing**: Vitest or equivalent; synthetic fixtures for schema, graph, adapter, and artifact tests

**Target Platform**: Local developer machine (Linux/macOS/WSL); no hosted SpecAble service required for v1

**Project Type**: library-first monorepo (`packages/*` domain logic; thin CLI/MCP adapters)

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify each item; record violations in Complexity Tracking with justification.

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | [ ] |
| II. Adapter-based | Is core logic free of Notion/Jira/Linear/GitHub/Figma/etc. dependencies? Are integrations adapter-only? | [ ] |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | [ ] |
| IV. MCP-first | If agent-facing, are read/query/validation/generation prioritized over write-back automation? | [ ] |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | [ ] |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | [ ] |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | [ ] |
| VIII. Vertical slice | Does this slice produce a demoable outcome (validate, summarize, query, detect gaps)? | [ ] |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | [ ] |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform, or vendor replacement ambitions? | [ ] |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | [ ] |
| Effect Requirements | Are service tags, Live Layer paths, composition root, and public method `R` documented? See [effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md). | [ ] |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

### TypeScript and service conventions

Per `.specify/memory/constitution.md` v1.2.0+ and
[effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md):

- **No `any`**: Use generics, Schema-inferred types, or `unknown` with narrowing.
- **Avoid type casts**: Prefer typed factories and Schema decode; document unavoidable casts at boundaries.
- **Hide storage I/O**: Expose repository/store-shaped services to consumers; compose file/adapter implementations in `services/` Layers only.
- **Requirements (`R`)**: Declare service dependencies in `Effect<A, E, R>`; access via `yield* Tag`; never pass service instances as parameters.
- **Layer absorption**: Resolve platform tags (`FileSystem`, `SqlClient`, etc.) during Layer construction; public consumer methods SHOULD have `R = never` when deps are captured at build time.
- **Composition root**: Provide Live Layers at entrypoints (`bin.ts`, test harness) — not inside CLI command modules.
- **No platform-node in library src**: `@effect/platform-node` only at entrypoints and tests.

### Service & Layer map

*Required when this feature introduces or changes Effect services or I/O boundaries.*

| Item | Detail |
|------|--------|
| Tags introduced | [e.g. `@specable/core/ProjectRootService`, `@specable/core/StorageBackend`] |
| Live Layer modules | [e.g. `packages/core/src/storage/layers.ts` → `JsonStorageBackendLive`, `SqliteStorageBackendLive`] |
| Composition root | [e.g. `packages/cli/src/services/Layers.ts`, `packages/cli/src/bin.ts`] |
| Public method `R` | [Which methods absorb platform deps at Layer build (`R = never`) vs propagate tags] |
| Local references | [e.g. `GraphLoader.ts`, `GraphRepository.ts`, `services/Layers.ts`] |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
