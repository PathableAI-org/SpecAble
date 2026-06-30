# Implementation Plan: Readable Semantic Wiki

**Branch**: `004-readable-semantic-wiki` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-readable-semantic-wiki/spec.md`

## Summary

Build two new `StorageBackend` implementations — **Markdown** (YAML frontmatter in `.md` files) and **Org** (property drawers in `.org` files) — that store each product primitive as a separate human-readable wiki file in a type-named subdirectory of the project root. Extend `StorageType` with `"md"` and `"org"` literals, wire through `RoutedStorageBackend`, and support `specable init --storage md|org`. All four backends (JSON, SQLite, Markdown, Org) must pass the same storage round-trip test suite with no backend-specific test branches.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node 22+

**Primary Dependencies**: Effect 3.x, `@effect/schema`, `@effect/platform`, `@effect/platform-node` (entrypoints/tests only), `js-yaml` (scoped to Markdown backend only)

**Storage**: On-disk file layout:
- Markdown: per-type directories with `.md` files, YAML frontmatter between `---` delimiters, prose body after
- Org: same per-type directories with `.org` files, property drawers (`:PROPERTIES:` … `:END:`), prose body after
- Shared wiki file-layout module for type→directory mapping, ID→filename sanitization, body extraction

**Testing**: `@effect/vitest` `it.effect`; test Layers for all four backends; temp-directory fixtures via `acquireUseRelease`; round-trip tests covering all alpha primitive types; manual edit and malformed-file tests for the wiki backends

**Target Platform**: Local developer machine (Linux/macOS/WSL); no hosted SpecAble service required

**Project Type**: library-first monorepo; new wiki backends live in `packages/core/src/storage/` alongside existing JSON and SQLite backends

**Performance Goals**: `list` and `get` on a project with hundreds of primitives across all types should complete in under 500ms on modern SSDs (same order of magnitude as JSON backend)

**Constraints**:
- `js-yaml` must be scoped to Markdown backend only (no dependency leak into domain or Org modules)
- Org property drawer parser must handle flat key-value pairs only; no multi-line values, nested drawers, tables, or LaTeX blocks
- File names derived from primitive IDs must be filesystem-safe; enforce at the wiki file-layout module boundary
- Body prose is opaque text — no encoding/decoding/transformation on round-trip
- Existing JSON and SQLite backends must remain unchanged and passing all existing tests

**Scale/Scope**: Nine alpha primitive types across two new backends; each primitive is one file; typical project might have 10–500 primitives

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify each item; record violations in Complexity Tracking with justification.

| Principle | Gate Question | Pass? |
|-----------|---------------|-------|
| I. Primitive graph canonical | Does this feature read/write typed primitives and relationships, not prose-only artifacts as source of truth? | ✅ Yes — wiki files encode the same typed primitives via frontmatter/property drawers; body prose supplements but does not replace structured metadata |
| II. Adapter-based | Is core logic free of Notion/Jira/Linear/GitHub/Figma/etc. dependencies? Are integrations adapter-only? | ✅ Yes — Markdown and Org are local file formats, not hosted services. `js-yaml` is the only new dependency, scoped to the Markdown backend. No vendor APIs |
| III. Local-first / OSS-first | Is the slice demoable locally without a hosted SpecAble platform? | ✅ Yes — fully local: `specable init --storage md` creates files on disk, `primitive create|list|get` reads/writes them. No network required |
| IV. MCP-first | If agent-facing, are read/query/validation/generation prioritized over write-back automation? | ✅ N/A — this feature extends storage backends, not agent interfaces. MCP considerations deferred to the interpretation layer milestone |
| V. Library-first | Is domain behavior planned for `packages/*` with thin CLI/MCP wrappers? | ✅ Yes — backends are `packages/core/src/storage/` implementations. CLI init gets two new `--storage` option values. No domain rules in CLI modules |
| VI. Explicit schemas | Are primitives, errors, adapter I/O, and outputs schema-defined with stable IDs? | ✅ Yes — frontmatter/property-drawer fields map to existing `@specable/domain` schemas. Decoding uses `Schema.decodeUnknown` via `PrimitiveSchemas.decodePrimitiveUnknown`. Errors are typed (`PrimitiveValidationError`, `StorageReadError`, etc.) |
| VII. Traceability | Do generated artifacts link to graph sources; are gaps reported instead of invented? | ✅ Yes — wiki files preserve the full primitive identity and provenance. Manual-edit round-trip preserves existing fields. Non-recoverable decode failures produce actionable errors |
| VIII. Vertical slice | Does this slice produce a demoable outcome (validate, summarize, query, detect gaps)? | ✅ Yes — demoable outcome: `specable init --storage md && specable primitive create --type Capability --name "Schedule session"` produces a readable `.md` file on disk. `list` and `get` read it back. Same for Org |
| IX. Human artifacts | Will the slice include Markdown or similar human-readable output where relevant? | ✅ Yes — the `.md` and `.org` files themselves are human-readable artifacts by design. No additional summary generation needed |
| X. Narrow v1 | Does scope avoid PM SaaS, full UI, cloud platform, or vendor replacement ambitions? | ✅ Yes — scope is strictly two local storage backends. No cloud, no UI, no vendor integration |
| Technical standards | Are TypeScript, pnpm, schema validation, and required test categories addressed? | ✅ Yes — TypeScript + pnpm, schema validation at decode boundaries, test categories include round-trip, decode failure, manual edit, and layout parity |
| Effect Requirements | Are service tags, Live Layer paths, composition root, and public method `R` documented? See [effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md). | ✅ Yes — see Service & Layer map below |

**Result**: All checks pass. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-readable-semantic-wiki/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (StorageBackend contract docs)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
packages/core/
├── src/
│   ├── storage/
│   │   ├── StorageBackend.ts        # Contract (existing)
│   │   ├── PrimitiveTypes.ts        # Canonical types (existing — extend)
│   │   ├── PrimitiveSchemas.ts       # Schema registry (existing — reused)
│   │   ├── SchemaDecode.ts           # Decoding utilities (existing — reused)
│   │   ├── RoutedStorageBackend.ts   # Router (existing — extend)
│   │   ├── JsonStorageBackend.ts     # Existing, unchanged
│   │   ├── SqliteStorageBackend.ts   # Existing, unchanged
│   │   ├── MarkdownStorageBackend.ts # NEW — .md + YAML frontmatter
│   │   ├── OrgStorageBackend.ts      # NEW — .org + property drawers
│   │   ├── wiki-file-layout.ts       # NEW — shared type→dir, ID→filename, sanitize
│   │   └── layers.ts                 # Re-exports (existing — add new exports)
│   ├── project/
│   │   └── ProjectConfig.ts          # StorageType schema (extend with "md" | "org")
│   └── index.ts                      # Generated export file (re-generate)
├── test/
│   ├── storage/
│   │   ├── storage-backends.test.ts  # Existing — extend with md/org
│   │   ├── storage-crud.test.ts      # Existing — extend with md/org
│   │   └── layout-contract.test.ts   # Existing — extend with md/org
│   └── fixtures/
│       └── project/
│           └── layers.ts             # Test layers (extend with md/org)

packages/domain/
└── src/                              # No changes needed

packages/cli/
├── src/
│   ├── cli/
│   │   └── InitCommand.ts            # Extend --storage option validation
│   └── services/
│       └── Layers.ts                 # Extend projectRootLiveLayer with md/org backends
└── test/                             # Integration tests (md/org init, create, list, get)
```

**Structure Decision**: Library-first monorepo. Wiki backends are new files in the existing `packages/core/src/storage/` directory, following the exact same pattern as `JsonStorageBackend.ts` and `SqliteStorageBackend.ts`. Shared file-layout logic is extracted into `wiki-file-layout.ts` to avoid duplication between the two new backends.

### TypeScript and service conventions

Per `.specify/memory/constitution.md` and [effect-service-patterns.md](../../.specify/memory/effect-service-patterns.md):

- **No `any`**: Use generics, Schema-inferred types, or `unknown` with narrowing.
- **Avoid type casts**: Prefer typed factories and Schema decode; document unavoidable casts at boundaries.
- **Hide storage I/O**: Expose repository/store-shaped services to consumers; compose file/adapter implementations in `services/` Layers only.
- **Requirements (`R`)**: Declare service dependencies in `Effect<A, E, R>`; access via `yield* Tag`; never pass service instances as parameters.
- **Layer absorption**: Resolve platform tags (`FileSystem`, `SqlClient`, etc.) during Layer construction; public consumer methods SHOULD have `R = never` when deps are captured at build time.
- **Composition root**: Provide Live Layers at entrypoints (`bin.ts`, test harness) — not inside CLI command modules.
- **No platform-node in library src**: `@effect/platform-node` only at entrypoints and tests.
- **No `._tag` on foreign ADTs**: Use `Either.isLeft`, `Option.isSome`, `Schema.decodeUnknown` in `Effect.gen`, or `match` APIs.

### Service & Layer map

| Item | Detail |
|------|--------|
| Tags introduced | `StorageBackend` at `@specable/core/StorageBackend` (existing tag — no new tag needed) |
| Live Layer modules | `packages/core/src/storage/layers.ts` → add `MarkdownStorageBackendLive`, `OrgStorageBackendLive`, their `R` types |
| Composition root | `packages/cli/src/services/Layers.ts` → `projectRootLiveLayer(storage)` extends to handle `"md"` and `"org"`; `RoutedStorageBackendLive` extended to route to all four backends |
| Public method `R` | All five `StorageBackendService` methods (`bootstrap`, `create`, `describe`, `get`, `list`) absorb `FileSystem.FileSystem` at Layer build — public `R = never` (identical to existing JSON/SQLite backends) |
| Local references | `JsonStorageBackend.ts` (pattern), `SqliteStorageBackend.ts` (pattern), `layers.ts` (re-exports), `RoutedStorageBackend.ts` (extension), `Layers.ts` (composition) |

**Dependency addition**: `js-yaml` (and `@types/js-yaml` for dev) added to `packages/core/package.json`, scoped to the Markdown backend only. No new runtime dependencies for Org backend — property drawer parsing uses a lightweight regex-based parser.

## Complexity Tracking

No constitution violations. All items pass cleanly.

---

## Phase 0: Research

### Knowns (no research needed)

Based on existing codebase exploration and the spec, the following are already well-understood:

1. **StorageBackend contract** — fully documented: 5 methods (`bootstrap`, `describe`, `create`, `list`, `get`), all with `R = never` after `FileSystem` absorption. Pattern: `make*StorageBackend` returns `Effect<StorageBackendService>` that captures `fs` from `FileSystem.FileSystem`.

2. **StorageType schema** — defined in `ProjectConfig.ts` as `Schema.Literal("json", "sqlite")`. Extension: add `"md"` and `"org"` strings. The `storageBindingFor` helper needs extension. The CLI `parseStorageType` function needs extension.

3. **PrimitiveTypes** — `PRIMITIVE_TYPE_FILES` maps `Capability → "capabilities.json"`, etc. For wiki backends, the existing map is unused; the new `wiki-file-layout.ts` provides directory-name and file-name-to-ID mappings instead.

4. **PrimitiveSchemas** — `schemaByType` and `decodePrimitiveUnknown` are reused directly for metadata decoding. No changes needed.

5. **RoutedStorageBackend** — currently routes between JSON and SQLite. Extended to accept all four backends (Markdown, Org) at construction.

6. **CLI init flow** — `InitCommand.ts` → `parseStorageType` → `ProjectRootService.initialize` → `storage.bootstrap`. Just needs the option validation and Layer wiring.

7. **Test Layer patterns** — `test/fixtures/project/layers.ts` provides `jsonStorageTestLayer` and `sqliteStorageTestLayer`. Analogous `mdStorageTestLayer` and `orgStorageTestLayer` follow the same pattern.

8. **YAML frontmatter format** — well-known: `---` delimiters at start of file, YAML key-value block, trailing `---`, then body prose. A mature library (`js-yaml`) handles encoding and decoding.

9. **Org property drawer format** — well-defined subset: `:PROPERTIES:` header, `:KEY: VALUE` lines, `:END:` terminator. Simple regex / line-based parser sufficient for flat key-value subset.

10. **Primitive ID assignment** — `assignPrimitiveId.ts` produces IDs like `cap-schedule-session-a1b2`. These are already filesystem-safe (alphanumeric + hyphens). The wiki file-layout module maps them to file names: `<type-prefix>-<slug>.md`.

### Unknowns

No unresolved NEEDS CLARIFICATION markers remain in the spec. The following are **technology or pattern decisions** that need confirmation through existing examples:

- **File name format**: Should file names use the full ID (e.g., `cap-schedule-session-a1b2.md`) or just the type prefix + slug (e.g., `cap-schedule-session.md`)? The milestone document uses the slug-only form for readability. The full ID includes the random suffix for uniqueness. **Decision**: Use the full ID for file names to guarantee uniqueness and avoid collisions. The milestone examples show slug-only names for illustration — this is a refinement.

- **Org backend**: should `#+TITLE:` be required in the Org file when the name is already in the property drawer? The milestone example includes both. **Decision**: `#+TITLE:` is a decorative Org convention for human readers, not a metadata field. The canonical name is always `:name:` in the property drawer. `#+TITLE:` is optional and ignored on decode.

- **Empty frontmatter / property drawer detection**: if a file has valid content but no frontmatter/drawer, how to distinguish from a non-primitive wiki file? **Decision**: the backend only iterates files matching the expected extension in each type directory. Any file found without proper frontmatter/drawer produces a decode error — there is no silent skip.

These decisions are **design choices** rather than research unknowns. They are documented in Phase 1.

**Research tasks** (minimal — all major architectural decisions are resolved):

| Task | Source | Outcome |
|------|--------|---------|
| Confirm `js-yaml` is the right YAML library for the Markdown backend | Assumptions section + npm | `js-yaml` is the standard choice; 11.7k+ stars, 60M+ weekly downloads, MIT license. `yaml` (eemeli/yaml) is an alternative but `js-yaml` is more widely used in the Effect/TypeScript ecosystem |
| Confirm no special handling needed for YAML frontmatter empty body or leading whitespace | js-yaml docs | `js-yaml.load("---\nkey: val\n---\n")` returns `{key: "val"}` and leaves the body after the closing `---` as the remainder — perfect for frontmatter extraction |
| Confirm Org property drawer regex approach for flat key-value pairs | Org mode spec | Org property drawers are explicitly flat key-value: one property per line, `:KEY: VALUE`. No nesting. Colons in values are allowed (e.g., `:description: "some: text"`). A line-by-line parser handles this cleanly |

All three confirmed. Phase 0 is complete — findings are recorded in `research.md`.

## Phase 1: Design & Contracts

### `data-model.md`

Covered in the spec and the contract documentation below. The data model is the existing `@specable/domain` primitive schemas — no new entities needed. Wiki-specific concepts are captured in the contracts.

### Contracts

See `contracts/README.md` for the StorageBackend interface contract. The wiki backends implement this contract. The key contract decisions are documented in the contracts directory.

### Quickstart

See `quickstart.md` for end-to-end validation commands.

---

## Rendered output summary

The following artifacts will be generated:
- `research.md` — Phase 0 consolidated findings (minimal, all knowns confirmed)
- `data-model.md` — Wiki file document model (in feature root)
- `contracts/README.md` — StorageBackend interface reference for wiki backends
- `quickstart.md` — Runnable validation scenarios
- Agent context update (SPECKIT markers in `.cursor/rules/specify-rules.mdc`)