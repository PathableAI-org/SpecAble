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

## Run against bundled generic example

```bash
# Interactive stdout report
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid

# Write shareable artifacts
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --out /tmp/specable-out
ls /tmp/specable-out
# summary.md  validation.json  integrity-report.json  integrity-report.md  check-result.json
```

**Expected**: exit code `0`; zero Active validation failures; summary preview on stdout; files written only with `--out`.

## Validate invalid example

```bash
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/invalid
```

**Expected**: exit code `1`; Active failures listed with primitive IDs; Draft issues as warnings; summary preview still shows **Known Modeling Gaps** if summary path runs (default full check).

## Scoped commands

```bash
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --validate-only
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --integrity-only
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --summary-only
```

## CoachBridge synthetic example

```bash
pnpm --filter @specable/cli exec specable check packages/cli/examples/coachbridge-synthetic/valid --out /tmp/coachbridge-out
```

**Expected**: validates offline with fictional entities only; no external credentials.

## Create a local graph project

1. Create directory `my-graph/`.
2. Add `graph.json` and primitive type `.json` files per [fixture-format.md](./contracts/fixture-format.md).
3. Run:

```bash
pnpm --filter @specable/cli exec specable check ./my-graph
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

Document answers in `packages/cli/examples/generic/README.md` during implementation.
