# CLI Command Contract

**Package**: `@specable/cli`  
**Binary**: `specable`  
**Runtime**: Node.js ≥ 20

## Commands

### `specable init <path>`

**Purpose**: Create a new SpecAble project root with selected storage backend and empty product primitive graph.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Target directory for the project root |

**Options**:

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--storage <type>` | no | `json` | `json` or `sqlite` |
| `--name <name>` | no | basename of `path` | Project display name |

**Behavior**:

1. Resolve `path` to absolute filesystem path.
2. If `specable.json` exists → fail `ProjectAlreadyInitializedError`.
3. If `path` does not exist → create directory (and parents as needed).
4. If `path` exists, is a directory, contains entries, and has no `specable.json` → fail `ProjectPathNotEmptyError`.
5. Bootstrap storage backend (JSON files or SQLite database).
6. Write `specable.json` last with generated `projectId`, storage binding, and metadata.
7. Print short success summary to stdout (project name, id, storage type, path).

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Project initialized |
| 2 | Usage error, unsupported storage, path conflict, I/O failure, or bootstrap failure |

**Stdout success example** (illustrative):

```text
Initialized SpecAble project "demo-json"
  projectId: 8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a
  storage: json
  root: /tmp/demo-json
```

### `specable project show <path>`

**Purpose**: Inspect an initialized project root and report configuration plus empty-graph state.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `path` | yes | Path to project root directory |

**Behavior**:

1. Resolve `path`; require directory with valid `specable.json`.
2. Decode config; delegate to storage backend for `GraphStoreSummary`.
3. Print `ProjectDescriptor` fields to stdout in stable order.

**Stdout field order**:

1. `projectId`
2. `name`
3. `rootPath`
4. `schemaVersion`
5. `storage.type`
6. `storage.location`
7. `primitiveTypes` (comma-separated)
8. `graph.totalPrimitives`
9. `graph.empty`
10. `createdAt`

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Descriptor printed |
| 2 | Path not a project root, decode error, incomplete storage, or I/O failure |

### `specable check <projectDir>` (unchanged)

v0 behavior preserved. Legacy fixture directories without `specable.json` remain valid check targets. Alpha roots become check targets in a later milestone when `GraphRepository` is storage-aware.

### `specable --help`

Standard `@effect/cli` help including new `init` and `project` subcommands.

## Implementation notes

- Command definitions: `packages/cli/src/cli/InitCommand.ts`, `ProjectShowCommand.ts`.
- Register in `RootCommand.ts`: `init` at top level; `project` group with `show` subcommand.
- Domain logic: `@specable/core` `ProjectRootService` and `StorageBackend` Layers.
- `packages/cli/src/bin.ts` composes core storage Layer + platform Layers + v0 `GraphRepositoryLive`.
- Importing `@specable/core` MUST NOT execute CLI or acquire live resources.
- No network services.

## Future flags (out of scope)

- `--format json` on `project show`
- `--force` re-init
- `specable project list`
