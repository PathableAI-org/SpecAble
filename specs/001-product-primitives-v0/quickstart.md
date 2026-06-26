# Quickstart: SpecAble v0 — Product Primitive Graph

**Feature**: `001-product-primitives-v0`  
**Plan**: [plan.md](./plan.md)  
**Contracts**: [cli-commands.md](./contracts/cli-commands.md), [fixture-format.md](./contracts/fixture-format.md), [output-artifacts.md](./contracts/output-artifacts.md)

> **Layout**: v0 uses two packages — `@specable/domain` (schemas) and `@specable/cli` (graph, validation, CLI). Commands below target `@specable/cli`.

## Prerequisites

- Node.js 24.x (CI pin; local 20+ acceptable during development)
- pnpm 11.x (`corepack enable && corepack prepare pnpm@11.8.0 --activate`)

## Repository setup (after implementation)

```bash
git clone <repo-url> SpecAble
cd SpecAble
pnpm install --frozen-lockfile
pnpm codegen
pnpm check
pnpm test
pnpm build
```

## Run against summary fixture (US3 default check)

```bash
# Default: validation + integrity + summary preview on stdout
pnpm build
pnpm --filter @specable/cli exec specable check packages/cli/test/fixtures/summary/valid

# Write shareable artifacts
pnpm --filter @specable/cli exec specable check packages/cli/test/fixtures/summary/valid --out /tmp/specable-out
```

**Expected**: exit code `0`; zero Active validation failures; stdout includes validation status, integrity warnings (if any), and a truncated summary preview; `--out` writes `summary.md`, `validation.json`, `integrity-report.json`, `integrity-report.md`, and `check-result.json`.

## Run against bundled generic example

```bash
# Default: validation + integrity + summary preview on stdout
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid

# Write shareable artifacts (see SC-005 comprehension checklist in examples/generic/README.md)
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --out /tmp/specable-generic-out

# Validation stdout report
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --validate-only

# Validation + integrity stdout report
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --integrity-only

# Summary preview only
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --summary-only
```

**Expected**: exit code `0`; zero Active validation failures; stdout includes validation status, integrity warnings (if any), and a truncated summary preview; `--out` writes `summary.md`, `validation.json`, `integrity-report.json`, `integrity-report.md`, and `check-result.json`.

## Validate invalid example

```bash
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/invalid --integrity-only
```

**Expected**: exit code `1`; Active failures listed in validation output with primitive IDs; Draft issues as validation warnings; integrity warnings alone do not change exit code.

## Integrity-specific scenarios (Session 2026-06-25)

After US2 implementation, verify with engineered fixtures:

```bash
# Duplicate normalized names → integrity warning only (exit 0 if no Active failures)
pnpm --filter @specable/cli exec specable check packages/cli/test/fixtures/integrity/duplicate-name --integrity-only

# Disconnected Actor → not an orphan; exit 0
pnpm --filter @specable/cli exec specable check packages/cli/test/fixtures/integrity/disconnected-actor-not-orphan --integrity-only

# Zero-edge Story → orphan warning on stdout (integrity-report.json with --out is US3)
pnpm --filter @specable/cli exec specable check packages/cli/test/fixtures/integrity/orphan-story --integrity-only
```

**Expected behaviors**:

- Name normalization: trim + lowercase; `" Schedule Session "` matches `"schedule session"`
- Likely duplicates: Jaccard ≥ 0.8 on word tokens
- Orphans: type-aware; disconnected Actors excluded
- `validation.json` and `integrity-report.json` do not duplicate Active under-linked failures

## CoachBridge synthetic example

```bash
# Default full check
pnpm --filter @specable/cli exec specable check packages/cli/examples/coachbridge-synthetic/valid

# Invalid variant (expect exit code 1)
pnpm --filter @specable/cli exec specable check packages/cli/examples/coachbridge-synthetic/invalid
```

**Expected**: validates offline with fictional entities only; no external credentials. See `packages/cli/examples/coachbridge-synthetic/README.md` for the synthetic-data disclaimer.

## Create a local graph project

1. Create directory `my-graph/`.
2. Add `graph.json` and primitive type `.json` files per [fixture-format.md](./contracts/fixture-format.md).
3. Run:

```bash
pnpm --filter @specable/cli exec specable check ./my-graph --validate-only
```

## Development loop

```bash
pnpm --filter @specable/cli dev          # tsx watch bin
pnpm --filter @specable/cli test
pnpm --filter @specable/cli coverage
pnpm lint
pnpm exec fallow audit --base main --format json --quiet
```

## Full pre-PR validation

```bash
pnpm codegen
pnpm check
pnpm lint
pnpm test
pnpm build
git add packages/cli/src && git diff-index --cached HEAD --exit-code packages/cli/src
pnpm exec fallow audit --base main --format json --quiet
```

## Comprehension checklist (SC-005)

After reading `summary.md` from the generic valid example, a new reviewer should be able to answer:

1. Name four primitive types present in the graph.
2. Identify two relationships (e.g., Persona → Primary Actor, Story → Capability).
3. Explain difference between Draft and Active validation behavior.
4. Point to where modeling gaps would appear if present.

Answers are documented in `packages/cli/examples/generic/README.md`.
