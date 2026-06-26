# Quickstart: Initialize JSON and SQLite Project Roots

**Feature**: `002-initialize-project-roots`  
**Plan**: [plan.md](./plan.md)  
**Contracts**: [cli-commands.md](./contracts/cli-commands.md), [project-config.md](./contracts/project-config.md), [storage-layouts.md](./contracts/storage-layouts.md)

## Prerequisites

- Node.js 20+ (CI pins 24.x)
- pnpm 11.x (`corepack enable`)
- Repository cloned and dependencies installed

```bash
cd SpecAble
pnpm install --frozen-lockfile
pnpm codegen
pnpm check
pnpm build
```

## Demo flow (milestone acceptance)

Uses synthetic local paths only.

### Initialize JSON-backed root

```bash
rm -rf /tmp/demo-json
pnpm --filter @specable/cli exec specable init /tmp/demo-json --storage json
```

**Expected**:

- Exit code `0`
- Success message with `projectId` and `storage: json`
- `/tmp/demo-json/specable.json` exists
- Nine `*.json` primitive files with empty `primitives` arrays (see [storage-layouts.md](./contracts/storage-layouts.md))

### Initialize SQLite-backed root

```bash
rm -rf /tmp/demo-sqlite
pnpm --filter @specable/cli exec specable init /tmp/demo-sqlite --storage sqlite
```

**Expected**:

- Exit code `0`
- `/tmp/demo-sqlite/specable.json` with `storage.type: "sqlite"`
- `/tmp/demo-sqlite/graph.sqlite` exists
- Database has zero primitive rows

### Inspect both roots

```bash
pnpm --filter @specable/cli exec specable project show /tmp/demo-json
pnpm --filter @specable/cli exec specable project show /tmp/demo-sqlite
```

**Expected** (both):

- Exit code `0`
- Output includes `projectId`, `name`, `storage.type`, `storage.location`, `primitiveTypes`, `graph.totalPrimitives: 0`, `graph.empty: true`
- Same `schemaVersion` and `primitiveTypes` list; differs only in storage fields

## Failure scenarios

### Re-init existing root

```bash
pnpm --filter @specable/cli exec specable init /tmp/demo-json --storage json
```

**Expected**: exit `2`; actionable already-initialized error; `specable.json` unchanged.

### Invalid storage type

```bash
pnpm --filter @specable/cli exec specable init /tmp/demo-bad --storage postgres
```

**Expected**: exit `2`; lists supported types `json`, `sqlite`.

### Inspect non-project path

```bash
pnpm --filter @specable/cli exec specable project show /tmp
```

**Expected**: exit `2`; not a valid SpecAble project root.

### Init into non-empty directory

```bash
mkdir -p /tmp/nonempty && touch /tmp/nonempty/existing.txt
pnpm --filter @specable/cli exec specable init /tmp/nonempty --storage json
```

**Expected**: exit `2`; path not empty error; no `specable.json` created.

## Verify on-disk layouts

```bash
ls -la /tmp/demo-json
ls -la /tmp/demo-sqlite
cat /tmp/demo-json/specable.json
```

**Expected**: layouts match [storage-layouts.md](./contracts/storage-layouts.md).

SQLite row count (optional manual check):

```bash
sqlite3 /tmp/demo-sqlite/graph.sqlite "SELECT COUNT(*) FROM primitives;"
```

**Expected**: `0`

## v0 regression check

Legacy fixtures must still work unchanged:

```bash
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid
```

**Expected**: exit `0` (no `specable.json` required on v0 fixture dirs).

## Automated tests (after implementation)

```bash
pnpm --filter @specable/cli test
```

**Expected suites** (to be added in implementation):

- JSON init creates config + empty type files
- SQLite init creates config + empty database
- Inspect reports descriptor for both backends
- Parity: identical `primitiveTypes` and empty graph summary
- Failure paths: re-init, invalid storage, non-empty dir, missing root

## Success criteria mapping

| Criterion | Verified by |
|-----------|-------------|
| SC-001 | Full demo flow above in < 5 minutes |
| SC-002 | Inspect output field checklist |
| SC-003 | Compare `primitiveTypes` and `graph.empty` across backends |
| SC-004 | Failure scenario section |
| SC-005 | `storage-layouts.md` + `ls` / `sqlite3` verification |
| SC-006 | Documented roots ready for milestone 2 CRUD (manual note) |
