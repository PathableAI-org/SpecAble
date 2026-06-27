# Quickstart: Create and Inspect Primitives

**Feature**: `003-create-inspect-primitives`  
**Plan**: [plan.md](./plan.md)  
**Contracts**: [cli-commands.md](./contracts/cli-commands.md), [primitive-operations.md](./contracts/primitive-operations.md), [storage-layouts.md](../002-initialize-project-roots/contracts/storage-layouts.md)

## Prerequisites

- Milestone 002 complete (or equivalent `@specable/core` init/inspect available)
- Node.js 22+ (per root `package.json` engines); pnpm 11.x
- Repository built

```bash
cd SpecAble
pnpm install --frozen-lockfile
pnpm codegen
pnpm check
pnpm build
```

## Setup demo roots

```bash
rm -rf /tmp/demo-json /tmp/demo-sqlite
pnpm --filter @specable/cli exec specable init /tmp/demo-json
pnpm --filter @specable/cli exec specable init /tmp/demo-sqlite --storage sqlite
```

**Expected**: Both exit 0; `specable.json` present; empty graph (`project show` reports `totalPrimitives: 0`).

## Demo flow (milestone acceptance)

Uses synthetic names only.

### Create primitives (JSON root)

```bash
pnpm --filter @specable/cli exec specable primitive create /tmp/demo-json \
  --type Capability --name "Schedule session" --status Draft

pnpm --filter @specable/cli exec specable primitive create /tmp/demo-json \
  --type Actor --name "Coach" --status Draft
```

**Expected**:

- Exit code `0` for each
- stdout includes assigned `id` (prefix `cap-` and `actor-` respectively)
- Capture capability ID from output for get step

### List and get (JSON root)

```bash
pnpm --filter @specable/cli exec specable primitive list /tmp/demo-json
pnpm --filter @specable/cli exec specable primitive list /tmp/demo-json --type Capability
pnpm --filter @specable/cli exec specable primitive get /tmp/demo-json --id <capability-id>
```

**Expected**:

- List without filter shows 2 primitives
- List with `--type Capability` shows 1 primitive
- Get returns full record matching create input (type, name, status)

### Repeat on SQLite root

```bash
pnpm --filter @specable/cli exec specable primitive create /tmp/demo-sqlite \
  --type Capability --name "Schedule session" --status Draft

pnpm --filter @specable/cli exec specable primitive create /tmp/demo-sqlite \
  --type Actor --name "Coach" --status Draft

pnpm --filter @specable/cli exec specable primitive list /tmp/demo-sqlite
```

**Expected**: Same semantic outcomes as JSON root (counts, summary fields, get round-trip).

### Inspect after create

```bash
pnpm --filter @specable/cli exec specable project show /tmp/demo-json
```

**Expected**:

- Exit code `0`
- `graph.totalPrimitives: 2`
- `graph.empty: false`
- Per-type counts include Capability: 1, Actor: 1

## Failure scenarios

### Unknown type

```bash
pnpm --filter @specable/cli exec specable primitive create /tmp/demo-json \
  --type NotARealType --name "Test"
```

**Expected**: Exit code `2`; error lists supported types.

### Invalid project root

```bash
pnpm --filter @specable/cli exec specable primitive list /tmp/nonexistent-root
```

**Expected**: Exit code `2`; actionable root error.

### Get missing ID

```bash
pnpm --filter @specable/cli exec specable primitive get /tmp/demo-json --id does-not-exist
```

**Expected**: Exit code `2`; not-found error.

### Optional field round-trip

```bash
pnpm --filter @specable/cli exec specable primitive create /tmp/demo-json \
  --type Actor --name "Provider" --status Draft \
  --set description="Primary care provider"

pnpm --filter @specable/cli exec specable primitive get /tmp/demo-json --id <actor-id>
```

**Expected**: Get output includes `description` field matching `--set` value.

## Automated validation

Run core storage tests (no CLI required):

```bash
pnpm --filter @specable/core test
```

**Expected**: Suites under `test/storage/` and `test/primitive/` pass create/list/get round-trips for JSON and SQLite.

Run CLI tests:

```bash
pnpm --filter @specable/cli test
```

**Expected**: Primitive command wiring, output format, and exit code tests pass.

Full suite before review:

```bash
pnpm codegen && pnpm check && pnpm lint && pnpm test && pnpm build
```

## Acceptance checklist mapping

| Criterion | Validation |
|-----------|------------|
| Create ≥2 types | Demo create Capability + Actor |
| List with stable IDs | `primitive list` output |
| Get matches create input | `primitive get` round-trip |
| JSON + SQLite parity | Repeat demo on both roots |
| Synthetic data only | `/tmp/demo-*` paths |
| Storage tests without CLI | `@specable/core test` |

## Related documentation

- Data model: [data-model.md](./data-model.md)
- Storage CRUD contract: [storage-crud.md](./contracts/storage-crud.md)
- Prior milestone quickstart: [../002-initialize-project-roots/quickstart.md](../002-initialize-project-roots/quickstart.md)
