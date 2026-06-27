# Research: Create and Inspect Primitives

**Feature**: `003-create-inspect-primitives`  
**Date**: 2026-06-27

## R1 — Primitive ID assignment

**Decision**: System assigns IDs at create time using the pattern `{typePrefix}-{slug(name)}-{suffix}` where `typePrefix` follows v0 fixture conventions (`cap-`, `actor-`, `obj-`, etc.), `slug(name)` is a lowercase kebab-case slug of the display name, and `suffix` is a 4-character base36 random segment for collision avoidance within the project root.

**Rationale**: Satisfies spec requirement for system-assigned stable opaque strings while preserving human-scanable IDs aligned with domain schema examples (`cap-schedule-session`). Suffix prevents collisions when the same name is created twice. Matches v0 graph conventions without requiring callers to supply IDs.

**Alternatives considered**:
- Raw UUID — rejected; harder to orient in demos and diverges from domain documentation examples.
- Caller-supplied ID — rejected; spec Assumptions state callers do not supply IDs at create.
- Sequential counter per type — rejected; not stable across export/import scenarios planned for later milestones.

## R2 — Storage abstraction extension shape

**Decision**: Extend existing `StorageBackendService` with three methods—`create`, `list`, `get`—operating on decoded domain `Primitive` values and `PrimitiveSummary` list DTOs. Update `describe` to count persisted primitives instead of requiring an empty graph.

**Rationale**: FR-019 requires consumers depend on typed storage operations behind the existing abstraction. Adding parallel `GraphStoreService` would duplicate routing and Layer wiring already solved by `RoutedStorageBackend`. Updating `describe` is required so `project show` works after creates (current backends fail describe when graph is non-empty).

**Alternatives considered**:
- Separate `PrimitiveStore` tag — rejected; splits storage routing and increases Layer composition complexity without clear boundary benefit at this slice.
- Put CRUD in `ProjectRootService` — rejected; mixes project manifest concerns with primitive instance I/O.
- Leave `describe` empty-only — rejected; breaks inspect after first primitive create.

## R3 — Alpha primitive type scope (8 vs 9 types)

**Decision**: `PrimitiveService.create` accepts eight alpha types from spec FR-004: Objective, Actor, Persona, DomainConcept, Capability, ExpectedResult, Workflow, Story. **CapabilityConceptLink** is excluded from create/list/get this milestone despite appearing in `CANONICAL_PRIMITIVE_TYPES` at init.

**Rationale**: CapabilityConceptLink is relationship-centric (capability + domainConcept + role); the milestone explicitly defers relationship work. Init still writes empty CCL files/rows for layout parity; list/get may return CCL records only if introduced by a later milestone or manual fixture edit—not via create command.

**Alternatives considered**:
- Support all nine types at create — rejected; CCL without relationship milestone adds untested edge cases.
- Remove CCL from init layout — rejected; breaks parity with v0 fixture format and future relationship slice.

## R4 — CLI input for type-specific fields

**Decision**: `specable primitive create` accepts required flags `--type`, `--name`, optional `--status` (default `Draft`), and repeatable optional `--set <key>=<value>` for top-level type-specific semantic fields (e.g., `--set description=...`, `--set category=provider`). Nested reference fields (e.g., `actors`, `workflows`) are out of scope for CLI flags this milestone—create at Draft with base fields only; relationship fields arrive with the relationship milestone.

**Rationale**: Milestone demo uses type, name, and status only. Repeatable `--set` covers Draft create with optional scalar fields without JSON blob parsing complexity. Reference arrays require relationship targets not yet creatable in structured form.

**Alternatives considered**:
- `--input primitives.json` file — deferred; useful for bulk import later.
- Full nested JSON `--fields '{...}'` — rejected for alpha; error-prone at CLI boundary.
- No optional fields at CLI — acceptable minimum but `--set` is low-cost and aids round-trip tests.

## R5 — Type schema registry location

**Decision**: Add `packages/core/src/storage/PrimitiveSchemas.ts` mapping each alpha type (and CapabilityConceptLink for decode-only) to its `@specable/domain` Schema. `PrimitiveService` and storage backends decode/encode through this registry. CLI `FixtureFiles.ts` remains for v0 `GraphLoader` unchanged.

**Rationale**: Core must decode at storage boundary without importing CLI. Duplication between core and CLI is acceptable short-term (same domain schemas, two maps); consolidation of v0 loader onto core registry is a later refactor outside this slice.

**Alternatives considered**:
- Move registry to `@specable/domain` — rejected; domain package stays Schema-only without graph loader concerns.
- Import CLI `FixtureFiles` from core — rejected; violates package dependency direction (core must not depend on cli).

## R6 — JSON backend create semantics

**Decision**: `create` reads the target type's JSON file, decodes the `{ primitives: [...] }` envelope, checks global ID uniqueness by scanning all nine type files, appends the new primitive, and writes the type file back. Use write-to-temp-then-rename for the modified file only.

**Rationale**: Matches existing per-type file layout from milestone 002. Global ID scan satisfies FR-013 duplicate ID detection across types. Single-file atomic rename limits partial-write risk.

**Alternatives considered**:
- Maintain separate ID index file — rejected; extra artifact outside v0 layout contract.
- Skip cross-file duplicate check — rejected; spec edge case requires detection.

## R7 — SQLite backend create/list/get semantics

**Decision**: `create` INSERT into `primitives(id, type, payload)` with JSON-serialized domain primitive as `payload`; duplicate `id` → `DuplicatePrimitiveIdError`. `list` SELECT with optional `type` filter; decode payload through type schema. `get` SELECT by `id`; decode or `PrimitiveNotFoundError`.

**Rationale**: Table schema already exists from milestone 002. Payload-as-JSON preserves semantic parity with JSON file entries without relational normalization.

**Alternatives considered**:
- Column-per-field normalization — rejected; premature for alpha CRUD slice.

## R8 — Draft-status validation depth

**Decision**: At create time, validate through `@specable/domain` Schema for the requested type with `status` set as provided. Only base required fields (`type`, `id`, `name`, `status`) are required for Draft; all type-specific fields remain optional per domain Schema. Do **not** invoke v0 `StatusAwareValidation` Active rules at create.

**Rationale**: Spec Assumptions defer Active-status enforcement. Domain Schema already encodes optional vs required fields. v0 Active rules belong to graph validation milestone, not storage CRUD.

**Alternatives considered**:
- Run full StatusAwareValidation on create — rejected; out of scope; would block Draft creates missing relationship refs.

## R9 — List summary shape

**Decision**: `PrimitiveSummary` DTO contains `id`, `type`, `name`, `status` only. Full projection returned by `get`.

**Rationale**: Matches spec FR-007 orientation fields. Avoids loading/decoding full payloads for list when SQLite backend could select minimal columns—but JSON backend still reads full entries; summary extraction happens in service layer for consistency.

**Alternatives considered**:
- List returns full primitives — rejected; spec distinguishes list summary from canonical read projection.

## R10 — Error taxonomy

**Decision**: Add tagged errors in `packages/core/src/primitive/errors.ts`: `UnknownPrimitiveTypeError`, `PrimitiveValidationError` (field paths + type), `PrimitiveNotFoundError`, `DuplicatePrimitiveIdError`, `InvalidProjectRootError` (reuse or wrap existing project errors). Storage decode failures map to `PrimitiveValidationError` or `IncompleteProjectError` as appropriate.

**Rationale**: FR-012 requires field-path-aware errors. Tagged errors enable CLI exit code 2 handling via `Schema.is` pattern from `InitCommand`.

**Alternatives considered**:
- Generic `Error` strings — rejected; violates constitution typed boundaries.

## R11 — Test strategy

**Decision**: Primary contract tests in `packages/core/test/storage/` run create/list/get round-trips through `RoutedStorageBackendLive` with temp directories (JSON) and temp SQLite files—no CLI. `packages/core/test/primitive/` tests `PrimitiveService` ID assignment and validation. CLI tests cover flag parsing, stdout field order, and exit codes only.

**Rationale**: SC-006 and FR-020 require storage-boundary tests independent of CLI. Matches milestone 002 test ownership split.

**Alternatives considered**:
- End-to-end CLI-only tests — rejected; insufficient for library-first principle.
