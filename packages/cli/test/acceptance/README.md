# Gherkin acceptance tests (Phase 2)

Executable acceptance scenarios for SpecAble CLI vertical slices. These mirror
[`specs/002-initialize-project-roots/quickstart.md`](../../../../specs/002-initialize-project-roots/quickstart.md)
and reuse subprocess helpers from [`../integration/helpers/`](../integration/helpers/).

## Run

```bash
pnpm test:acceptance
```

Requires a prior build (`pnpm build`); the `test:acceptance` script runs build first.

## Tag filtering

```bash
CUCUMBER_OPTIONS="--tags @smoke" pnpm test:acceptance
CUCUMBER_OPTIONS="--tags @init" pnpm test:acceptance
```

## Layout

- `features/` — Gherkin scenarios
- `step-definitions/` — step implementations (delegate to integration helpers)
- `support/` — World and hooks

Subprocess integration tests in Vitest (Phase 1) remain the primary automated
acceptance suite during day-to-day development. Use Gherkin when
stakeholder-readable specs are needed for milestones or release gates.
