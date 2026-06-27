# SpecAble

**SpecAble v0 — Product Primitive Graph**

Open-source, local-first CLI for validating JSON product primitive fixture graphs, reporting relationship integrity issues, and generating deterministic Markdown summaries and JSON reports.

SpecAble models durable product intent as typed primitives (Objectives, Actors, Personas, Domain Concepts, Capabilities, Expected Results, Workflows, Stories, and related links) instead of prose-only artifacts. The `specable check` command is the primary entry point for validation, integrity reporting, and summary generation — fully offline, with no Notion, MCP, or cloud runtime dependencies.

Repository: [PathableAI-org/SpecAble](https://github.com/PathableAI-org/SpecAble)

## Prerequisites

- Node.js 20+ (CI pins Node 24.x)
- pnpm 11.x (`corepack enable && corepack prepare pnpm@11.8.0 --activate`)

## Commands

Run from the repository root:

| Command | Description |
|---------|-------------|
| `pnpm install --frozen-lockfile` | Install dependencies |
| `pnpm codegen` | Generate package exports via `@effect/build-utils` |
| `pnpm check` | Typecheck all projects (`tsc -b tsconfig.json`) |
| `pnpm typecheck` | Alias for `pnpm check` |
| `pnpm lint` | ESLint over `src/`, `test/`, `examples/`, `scripts/` |
| `pnpm lint-fix` | Apply ESLint fixes |
| `pnpm test` | Run Vitest suites |
| `pnpm coverage` | Run tests with v8 coverage (smoke run; see Coverage below) |
| `pnpm build` | Build publishable output |
| `pnpm clean` | Remove generated build artifacts |
| `pnpm specable` | Run the CLI after `pnpm build` (e.g. `pnpm specable check <dir>`) |

### Git hooks

`pnpm install` enables [Husky](https://typicode.github.io/husky/) pre-commit hooks:

1. **lint-staged** — ESLint with `--fix` on staged TypeScript and `.mjs` files
2. **typecheck** — `pnpm check`
3. **codegen** — runs `pnpm codegen` on every commit; fails if generated `index.ts` files are out of date
4. **fallow audit** — dead-code and duplication gate against the branch merge-base (default `main`)

Bypass once: `git commit --no-verify`

Focused package commands (run `pnpm build` before `pnpm specable`):

```sh
pnpm --filter @specable/domain test
pnpm --filter @specable/cli test
pnpm build
pnpm specable check packages/cli/examples/generic/valid
```

Before requesting review:

```sh
pnpm codegen
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm coverage
pnpm exec fallow audit --base main --format json --quiet
```

## Package Layout

v0 uses a **two-package** pnpm workspace: `@specable/domain` (schemas) and `@specable/cli` (graph, validation, CLI).

```text
packages/domain/                 # @specable/domain
├── src/
│   ├── unions/                  # Schema literal unions (Status, roles, …)
│   ├── primitives/              # Nine primitive schemas
│   ├── Reference.ts
│   ├── PrimitiveBase.ts
│   └── errors.ts
└── test/                        # Minimal schema encode/decode tests

packages/cli/                    # @specable/cli
├── bin/specable.js              # Workspace CLI shim (requires build)
├── src/
│   ├── bin.ts                   # Node entry (Command.run)
│   ├── index.ts                 # Generated exports
│   ├── cli/                     # @effect/cli command adapters
│   ├── graph/                   # JSON load, index, traverse
│   ├── validation/              # Status-aware rules engine
│   ├── integrity/               # Duplicates, derivations, advisories
│   ├── summary/                 # Markdown + preview
│   ├── story/                   # Template text generation
│   └── services/                # FileSystem, GraphRepository Layers
├── test/                        # @effect/vitest suites
└── examples/
    ├── generic/{valid,invalid}/
    └── coachbridge-synthetic/{valid,invalid}/
```

Importing `@specable/cli` or `@specable/domain` must not execute the CLI or acquire live resources. Runtime execution belongs in `packages/cli/src/bin.ts` only.

Feature documentation lives under `specs/001-product-primitives-v0/` (plan, data model, contracts, quickstart).

## Coverage

`pnpm coverage` runs Vitest with the v8 provider across both packages. This is a **smoke run** for local and pre-PR checks — there are no enforced CI thresholds in v0.

Per architecture constraint AC-004, `@specable/domain` test coverage is intentionally minimal (complex schema compositions only). Comprehensive validation, graph, integrity, summary, and CLI behavior tests live in `@specable/cli`.

## Effect Guidance

This project targets Effect v3 (`effect`, `@effect/schema`, `@effect/cli`, `@effect/platform`, `@effect/vitest`) as recorded in `pnpm-lock.yaml`. Do not introduce Effect v4 APIs until the project explicitly adopts Effect v4.

- Validate boundaries with `Schema`; represent expected failures as tagged errors.
- Put filesystem and JSON parsing behind Effect services with live and test Layers.
- Keep CLI adapters thin; compose Layers at the application root in `packages/cli/src/services/`.
- Use `@effect/vitest` for Effect program tests with deterministic fixtures.

See [AGENTS.md](./AGENTS.md) for full architecture rules, testing requirements, and agent conventions.

## Publishing

`@specable/domain` and `@specable/cli` are configured for public npm publishing through [Changesets](https://github.com/changesets/changesets). **We are pre-MVP**: changesets accumulate on `main`, but nothing is published to npm until maintainers start the alpha line.

| Phase | What happens |
|-------|----------------|
| **Pre-MVP (now)** | Add `pnpm changeset` with publishable PRs. CI opens a **Version Packages** PR — do **not** merge it until MVP. |
| **First alpha (MVP)** | Run `pnpm changeset-pre-enter-alpha`, merge Version Packages PR, then trigger **Publish to npm** in Actions. |
| **Stable** | Run `pnpm changeset-pre-exit`, version, publish to `latest`. |

See [`.changeset/README.md`](./.changeset/README.md) for the full workflow, prerelease mode, and snapshot alternatives.

| Command | Description |
|---------|-------------|
| `pnpm changeset` | Record a changeset for the current PR |
| `pnpm changeset-version` | Apply pending changesets locally |
| `pnpm changeset-pre-enter-alpha` | Enter alpha prerelease mode (`0.x.x-alpha.N`) |
| `pnpm changeset-pre-exit` | Exit prerelease mode before a stable release |
| `pnpm changeset-publish` | Build, test, and publish to npm |

- **Version PRs**: `.github/workflows/release.yml` (no automatic publish)
- **npm publish**: `.github/workflows/publish.yml` (manual `workflow_dispatch` until post-alpha automation)

## Template Adaptation

This repository is adapted from [PathableAI-org/effect-typescript-template](https://github.com/PathableAI-org/effect-typescript-template) for SpecAble v0's product-primitive graph CLI:

| Template default | SpecAble v0 |
|------------------|-------------|
| `packages/domain`, `packages/server`, `packages/cli` | `packages/domain` + `packages/cli` (no server package) |
| `@template/*` package scopes | `@specable/domain`, `@specable/cli` |
| Todo HTTP vertical slice | Product primitive graph validation CLI |
| Multi-package project references | Root `tsconfig.json` references `packages/domain` and `packages/cli` |

Retained from the template: pnpm workspaces, strict TypeScript, `@effect/build-utils` codegen, ESLint flat config with `@effect/eslint-plugin`, Vitest + `@effect/vitest`, Changesets release flow, Fallow audit CI, and `AGENTS.md` agent conventions.
