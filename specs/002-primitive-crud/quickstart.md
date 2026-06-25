# Quickstart: Primitive CRUD

**Feature**: `002-primitive-crud`  
**Prerequisites**: `pnpm install`, `pnpm build`, `@specable/cli` on PATH (`pnpm exec specable`)

Validation scenarios prove local primitive authoring works end-to-end and unblocks `001` `specable check`.

## 1. Scaffold a project

```bash
export PROJECT=/tmp/specable-crud-demo
rm -rf "$PROJECT"
pnpm exec specable init "$PROJECT" --name "CRUD Demo" --scaffold-files
```

**Expected**: Exit `0`. Directory contains `graph.json` and nine `*.json` type files with empty `primitives` arrays.

```bash
cat "$PROJECT/graph.json"
```

**Expected**: `"schemaVersion": 1`, `"name": "CRUD Demo"`.

## 2. Create an Actor

```bash
pnpm exec specable primitive create "$PROJECT" --file - <<'EOF'
{
  "type": "Actor",
  "id": "actor-coach",
  "name": "Coach",
  "status": "Draft",
  "description": "Primary human operator",
  "category": "Human"
}
EOF
```

**Expected**: Exit `0`. Stdout includes `"action": "created"` and primitive JSON. `actors.json` contains one entry.

## 3. Get and list

```bash
pnpm exec specable primitive get "$PROJECT" actor-coach
pnpm exec specable primitive list "$PROJECT" --type Actor
```

**Expected**: Exit `0`. Get prints the Actor object. List prints `{ "primitives": [ ... ] }` with one item.

## 4. Update status

```bash
pnpm exec specable primitive update "$PROJECT" actor-coach --file - <<'EOF'
{
  "type": "Actor",
  "id": "actor-coach",
  "name": "Coach",
  "status": "Active",
  "description": "Primary human operator",
  "category": "Human"
}
EOF
```

**Expected**: Exit `0`. `"action": "updated"`. On-disk record reflects `Active`.

## 5. Duplicate ID rejection

```bash
pnpm exec specable primitive create "$PROJECT" --file - <<'EOF'
{
  "type": "Capability",
  "id": "actor-coach",
  "name": "Collision",
  "status": "Draft",
  "description": "Should fail"
}
EOF
```

**Expected**: Exit `2`. No change to `capabilities.json`.

## 6. Delete

```bash
pnpm exec specable primitive delete "$PROJECT" actor-coach
pnpm exec specable primitive get "$PROJECT" actor-coach
```

**Expected**: Delete exits `0`. Get exits `2` (not found). `actors.json` is `{ "primitives": [] }`.

## 7. Author minimal graph and run check (integration with `001`)

Re-create actors and add linked primitives (abbreviated — expand as needed for validation):

```bash
pnpm exec specable init "$PROJECT" --force --scaffold-files --name "Check Demo"

# Add primitives via create (Actor, Capability, ExpectedResult, Workflow, Story, ...)
# See packages/cli/examples/generic/valid for reference shapes once implemented.
```

```bash
pnpm exec specable check "$PROJECT" --validate-only
```

**Expected**: Exit `0` or `1` depending on Active completeness — but **not** exit `2` (no decode errors). Proves CRUD output is loader-compatible.

## 8. Optional post-write validation

```bash
pnpm exec specable primitive create "$PROJECT" --file actor.json --check
```

**Expected**: Write succeeds (exit `0`); validation summary printed when `--check` passed.

## Failure scenarios

| Scenario | Command | Expected exit |
|----------|---------|---------------|
| Init on conflicting dir | `specable init .` (with existing primitives, no `--force`) | 2 |
| Invalid JSON payload | create with malformed JSON | 2 |
| ID mismatch on update | update payload `id` ≠ CLI id | 2 |
| Type change on update | update Actor payload with `"type": "Capability"` | 2 |

## References

- Data model: [data-model.md](./data-model.md)
- CLI contract: [contracts/cli-commands.md](./contracts/cli-commands.md)
- Write contract: [contracts/write-operations.md](./contracts/write-operations.md)
- Fixture layout: [001 fixture format](../001-product-primitives-v0/contracts/fixture-format.md)
