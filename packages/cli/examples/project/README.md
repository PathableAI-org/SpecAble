# Alpha Project Root Examples

Synthetic empty SpecAble **project roots** for manual demos and documentation. Each directory is a fully initialized alpha root with `specable.json` and an empty graph namespace.

These differ from v0 fixture directories under `generic/` and `coachbridge-synthetic/`, which use per-type JSON files only and do not require `specable.json`.

## Layout

| Directory | Storage | Purpose |
|-----------|---------|---------|
| `json-empty/` | JSON (default) | Empty JSON-backed root with nine type files |
| `sqlite-empty/` | SQLite | Empty SQLite-backed root; `graph.schema.sql` is the reviewable source, `graph.sqlite` is generated locally |

On-disk layouts match [storage-layouts.md](../../../../specs/002-initialize-project-roots/contracts/storage-layouts.md).

## Usage

From the repository root (after `pnpm build`):

```bash
# Materialize SQLite example databases from graph.schema.sql (required for sqlite-empty)
pnpm prepare-examples

# Inspect JSON-backed empty root
pnpm specable project show packages/cli/examples/project/json-empty

# Inspect SQLite-backed empty root
pnpm specable project show packages/cli/examples/project/sqlite-empty
```

**Expected** (both):

- Exit code `0`
- Output includes `projectId`, `name`, `storage.type`, `storage.location`, `primitiveTypes`, `graph.totalPrimitives: 0`, `graph.empty: true`

## Related docs

- [Quickstart demo flow](../../../../specs/002-initialize-project-roots/quickstart.md)
- [CLI command contract](../../../../specs/002-initialize-project-roots/contracts/cli-commands.md)
- [Project config schema](../../../../specs/002-initialize-project-roots/contracts/project-config.md)

## Regenerating examples

To recreate from scratch (new `projectId` values):

```bash
rm -rf packages/cli/examples/project/json-empty packages/cli/examples/project/sqlite-empty
pnpm specable init packages/cli/examples/project/json-empty --name demo-json-empty
pnpm specable init packages/cli/examples/project/sqlite-empty --storage sqlite --name demo-sqlite-empty
```

For SQLite examples, copy the schema DDL from the generated database into `graph.schema.sql`, remove the committed `graph.sqlite`, and run `pnpm prepare-examples` to verify materialization.

Alternatively, edit `sqlite-empty/graph.schema.sql` directly and run:

```bash
pnpm prepare-examples
```
