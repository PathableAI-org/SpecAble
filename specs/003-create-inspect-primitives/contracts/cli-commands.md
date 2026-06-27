# CLI Command Contract: Primitive Operations

**Package**: `@specable/cli`  
**Binary**: `specable`  
**Runtime**: Node.js ≥ 22  
**Depends on**: Initialized project root from milestone 002 (`specable.json` present)

## Commands

### `specable primitive create <path>`

**Purpose**: Create and persist a product primitive in the project root graph store.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to initialized project root |

**Options**:

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--type <type>` | yes | — | Primitive type (see supported types below) |
| `--name <name>` | yes | — | Display name |
| `--status <status>` | no | `Draft` | `Draft`, `Active`, or `Deprecated` |
| `--set <key>=<value>` | no | — | Repeatable; optional top-level semantic field |

**Supported `--type` values** (case-sensitive):

`Objective`, `Actor`, `Persona`, `DomainConcept`, `Capability`, `ExpectedResult`, `Workflow`, `Story`

**Behavior**:

1. Resolve `path`; require directory with valid `specable.json`.
2. Validate `--type` against alpha supported set.
3. Build create input; merge `--set` key/value pairs into optional fields.
4. Invoke `@specable/core` `PrimitiveService.create`.
5. Print created primitive ID and summary to stdout.

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Primitive created |
| 2 | Usage error, invalid root, unknown type, validation failure, duplicate ID, or I/O failure |

**Stdout success example**:

```text
Created Capability "Schedule session"
  id: cap-schedule-session-x7k9
  status: Draft
  root: /tmp/demo-json
```

---

### `specable primitive list <path>`

**Purpose**: List persisted primitives in a project root with optional type filter.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to initialized project root |

**Options**:

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--type <type>` | no | all types | Filter to one alpha supported type |

**Behavior**:

1. Resolve `path`; require valid project root.
2. Invoke `PrimitiveService.list` with optional type filter.
3. Print summaries in stable order: sorted by `type`, then `name`, then `id`.

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | List printed (may be empty) |
| 2 | Invalid root, invalid filter type, decode error, or I/O failure |

**Stdout success example**:

```text
2 primitives in /tmp/demo-json

Capability  cap-schedule-session-x7k9  "Schedule session"  Draft
Actor       actor-coach-a1b2           "Coach"             Draft
```

**Empty graph example**:

```text
0 primitives in /tmp/demo-json
```

---

### `specable primitive get <path>`

**Purpose**: Retrieve full canonical projection for one primitive by ID.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to initialized project root |

**Options**:

| Flag | Required | Description |
|------|----------|-------------|
| `--id <id>` | yes | Primitive identifier |

**Behavior**:

1. Resolve `path`; require valid project root.
2. Invoke `PrimitiveService.get` with `--id`.
3. Print structured primitive record to stdout (stable field order).

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Primitive printed |
| 2 | Invalid root, not found, malformed ID, decode error, or I/O failure |

**Stdout field order**:

1. `id`
2. `type`
3. `name`
4. `status`
5. Remaining persisted fields alphabetically by key (excluding above)
6. Omit unset optional fields

---

## Command registration

- Add `primitive` command group to `RootCommand.ts` with subcommands `create`, `list`, `get`.
- Implementation: `PrimitiveCreateCommand.ts`, `PrimitiveListCommand.ts`, `PrimitiveGetCommand.ts`.
- Formatting: `render/PrimitiveOutput.ts`.
- Error handlers: `resolvePrimitiveCommandExit` pattern in `bin.ts`.

## Unchanged commands

- `specable init`, `specable project show`, `specable check` — behavior preserved except `project show` now reports non-empty graph counts after creates (via updated `describe`).

## Implementation notes

- Domain logic: `@specable/core` `PrimitiveService` only.
- Layer composition: `packages/cli/src/services/Layers.ts` provides `PrimitiveServiceLive`.
- `--set` values are strings; service coerces booleans/numbers if unambiguous or defers to Schema validation errors.
