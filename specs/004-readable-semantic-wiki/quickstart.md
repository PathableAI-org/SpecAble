# Quickstart: Readable Semantic Wiki

**Date**: 2026-06-29 | **Feature**: Readable Semantic Wiki | **Spec**: [spec.md](./spec.md)

This quickstart validates the Markdown and Org wiki backends end-to-end. Run from the repository root after `pnpm build`.

## Prerequisites

- Node 22+, pnpm 11.x (managed via Corepack)
- `pnpm install` completed
- `pnpm build` completed

## Validation Scenarios

### 1. Initialize a Markdown-backed project

```sh
specable init /tmp/demo-wiki --storage md
```

**Expected outcome**:
- Directory `/tmp/demo-wiki/` is created
- Subdirectories exist: `capabilities/`, `actors/`, `objectives/`, `personas/`, `domain-concepts/`, `expected-results/`, `workflows/`, `stories/`, `capability-concept-links/`
- File `/tmp/demo-wiki/specable.json` exists with `"storage": {"type": "md", "location": "."}`
- No `.md` files exist yet (empty project)

### 2. Create a primitive on the Markdown backend

```sh
specable primitive create /tmp/demo-wiki --type Capability --name "Schedule session" --status Draft --body "Let coaches create, update, and confirm coaching sessions."
```

**Expected outcome**:
- A file `capabilities/cap-<slug>-<suffix>.md` is created (exact name depends on ID generation)
- File contains YAML frontmatter with `id`, `type`, `name`, `status`, and body prose below
- File is human-readable in any text editor

### 3. List primitives on the Markdown backend

```sh
specable primitive list /tmp/demo-wiki
```

**Expected outcome**:
- Output includes a row for the created Capability with id, name (Schedule session), status (Draft), and type (Capability)

### 4. Get a primitive by ID on the Markdown backend

```sh
specable primitive get /tmp/demo-wiki --id <id-from-list>
```

**Expected outcome**:
- Full primitive data is displayed including id, type, name, status, and any provided body

### 5. Initialize an Org-backed project

```sh
specable init /tmp/demo-org --storage org
```

**Expected outcome**:
- Same directory layout as Markdown, but with `.org` files expected
- `specable.json` records `"storage": {"type": "org", "location": "."}`

### 6. Create and read on the Org backend

```sh
specable primitive create /tmp/demo-org --type Capability --name "Schedule session" --status Draft --body "Let coaches create, update, and confirm coaching sessions."
specable primitive list /tmp/demo-org
specable primitive get /tmp/demo-org --id <id-from-list>
```

**Expected outcome**:
- An `.org` file with an Org property drawer and body prose
- `list` and `get` return the same structured data as the Markdown backend (semantic parity)

### 7. Manual edit round-trip

```sh
# Identify the .md file from step 2
FILE=$(ls /tmp/demo-wiki/capabilities/cap-*.md | head -1)

# Append body text after the frontmatter (preserves all existing metadata)
sed -i '' 's/$/\n\nEdited body content added via manual edit./' "$FILE"

# Re-read with specable
specable primitive get /tmp/demo-wiki --id "$(basename "$FILE" .md)"
```

**Expected outcome**:
- The primitive ID, type, name, and status remain unchanged
- The body reflects the edited content appended to the original body prose

### 8. All four backends pass the same test suite

```sh
pnpm --filter @specable/core test
```

**Expected outcome**:
- All storage round-trip tests pass for JSON, SQLite, Markdown, and Org backends
- No backend-specific test branches — same assertions validate all four
- Existing JSON and SQLite tests continue to pass with no changes

## CLI Commands Reference

| Command | Behavior |
|---------|----------|
| `specable init <path> --storage md` | Initialize Markdown-backed wiki project |
| `specable init <path> --storage org` | Initialize Org-backed wiki project |
| `specable primitive create <path> --type <T> --name <N> --status <S>` | Create primitive as wiki file |
| `specable primitive list <path>` | List all primitives from wiki project |
| `specable primitive get <path> --id <id>` | Get single primitive by ID |
| `specable project show <path>` | Show project info including storage type |

## Expected Test Coverage

| Test Area | File | What It Validates |
|-----------|------|-------------------|
| Backend bootstrap | `storage-backends.test.ts` | `md` and `org` bootstrap creates correct directories |
| Primitive CRUD | `storage-crud.test.ts` | Create, list, get, describe round-trip on wiki backends |
| Layout contract | `layout-contract.test.ts` | On-disk layout matches expected structure |
| Decode failures | `storage-crud.test.ts` | Malformed frontmatter/drawer produces typed errors |
| Manual edit resilience | `storage-crud.test.ts` | Edited body prose preserves identity and metadata |
| Duplicate ID rejection | `storage-crud.test.ts` | ID collision produces `DuplicatePrimitiveIdError` |
| All four backend parity | `storage-crud.test.ts` | Same assertions pass on JSON, SQLite, MD, Org |