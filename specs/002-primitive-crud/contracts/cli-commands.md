# CLI Command Contract — Primitive CRUD

**Package**: `@specable/cli`  
**Binary**: `specable`  
**Feature**: `002-primitive-crud`  
**Depends on**: `001` fixture format, domain schemas, `specable check` (optional `--check`)

## Commands

### `specable init <projectDir>`

**Purpose**: Scaffold a new local graph project directory.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Path to create or initialize |

**Options**:

| Flag | Description |
|------|-------------|
| `--name <string>` | Project name in `graph.json` |
| `--description <string>` | Optional description in `graph.json` |
| `--scaffold-files` | Create all nine empty per-type JSON files |
| `--force` | Overwrite init-managed files (`graph.json`, scaffolded type files) when present |

**Default behavior**: Create directory; write `graph.json` with `schemaVersion: 1`; do not create per-type files.

**Stdout**: JSON summary `{ "projectDir", "created": string[], "skipped": string[] }`

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage error, directory exists with conflicting files (without `--force`), or I/O failure |

---

### `specable primitive create <projectDir>`

**Purpose**: Add a new primitive to the graph project.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Graph project root |

**Options**:

| Flag | Description |
|------|-------------|
| `--file <path>` | JSON primitive payload; if omitted, read stdin |
| `--check` | After write, run validation-only check and print status (does not change exit code) |
| `--quiet` | Emit minimal confirmation instead of full JSON record |

**Payload**: Single primitive object with required `type`, `id`, `name`, `status`, and type-specific fields per `@specable/domain`.

**Stdout**: `WriteResult` + full primitive JSON (unless `--quiet`)

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Created |
| 2 | Decode error, duplicate ID, project not found, I/O error |

---

### `specable primitive get <projectDir> <id>`

**Purpose**: Fetch one primitive by ID.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Graph project root |
| `id` | yes | Primitive ID |

**Stdout**: Primitive JSON object

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Found |
| 2 | Not found, project not found, I/O error |

---

### `specable primitive list <projectDir>`

**Purpose**: List primitives, optionally filtered by type.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Graph project root |

**Options**:

| Flag | Description |
|------|-------------|
| `--type <PrimitiveType>` | Filter to one type (`Actor`, `Capability`, …) |

**Stdout**: `{ "primitives": [ ... ] }` sorted by `id`

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Success (empty list allowed) |
| 2 | Invalid type filter, project not found, I/O error |

---

### `specable primitive update <projectDir> <id>`

**Purpose**: Replace an existing primitive.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Graph project root |
| `id` | yes | ID of primitive to replace |

**Options**: Same as `create` (`--file`, `--check`, `--quiet`)

**Constraints**:

- Payload `id` MUST equal `<id>` argument
- Payload `type` MUST equal stored primitive type

**Stdout**: `WriteResult` + updated primitive JSON (unless `--quiet`)

**Exit codes**: Same as `create`, plus not-found for missing `<id>`

---

### `specable primitive delete <projectDir> <id>`

**Purpose**: Remove a primitive by ID.

**Arguments**:

| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Graph project root |
| `id` | yes | Primitive ID |

**Options**:

| Flag | Description |
|------|-------------|
| `--check` | After delete, run validation-only check |
| `--quiet` | Minimal confirmation |

**Stdout**: `WriteResult` with `action: "deleted"`

**Exit codes**:

| Code | Meaning |
|------|---------|
| 0 | Deleted |
| 2 | Not found, project not found, I/O error |

---

## Command registration

- `packages/cli/src/bin.ts` registers `init` and `primitive` command group.
- Primitive subcommands live under `packages/cli/src/cli/primitive/`.
- `specable check` from `001` remains unchanged.

## Implementation notes

- JSON stdin: when `--file` absent and stdin is not a TTY, read entire stdin as payload.
- All filesystem access through Effect `FileSystem` service in Layers.
- Machine-readable stdout for scripting; errors to stderr with tagged error messages.

## Future commands (out of scope)

- `specable primitive move` (change type / cross-file)
- Bulk `import` / `export`
- MCP `primitive.create` tool
