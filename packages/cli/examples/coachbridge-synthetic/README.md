# Riverside Coach Platform — Synthetic Demo

> **Synthetic data disclaimer**: This example uses entirely fictional names, personas, and scenarios. It does not contain real Pathable customer data, production CoachBridge content, or internal Notion documentation. All entities (Morgan Coach, Taylor Participant, Riverside platform) are invented for demonstration purposes only.

## Scenario

A small CoachBridge-inspired coaching platform graph modeling:

- **Coach onboarding**: Morgan Coach completes profile setup and publishes availability.
- **Session scheduling**: Taylor Participant books a coaching session.

The graph includes all nine Product Primitive types with coaching-domain vocabulary while remaining fully offline and self-contained.

## Layout

| Directory | Purpose |
|-----------|---------|
| `valid/` | Fictional but correctly modeled coaching platform graph |
| `invalid/` | Synthetic mistake patterns (broken reference, Draft objective) |

## Usage

From the repository root (after `pnpm build`):

```bash
# Valid graph — expect exit code 0
node packages/cli/build/esm/bin.js check packages/cli/examples/coachbridge-synthetic/valid

# Invalid graph — expect exit code 1 (broken reference in story)
node packages/cli/build/esm/bin.js check packages/cli/examples/coachbridge-synthetic/invalid

# Scoped modes on valid graph
node packages/cli/build/esm/bin.js check packages/cli/examples/coachbridge-synthetic/valid --integrity-only
node packages/cli/build/esm/bin.js check packages/cli/examples/coachbridge-synthetic/valid --summary-only
```

## Mistake patterns in `invalid/`

| Pattern | Where to look | Severity |
|---------|---------------|----------|
| Draft incompleteness | `obj-draft-mobile-app` in `objectives.json` | validation warning |
| Broken reference | `story-complete-onboarding` references `result-missing` in `stories.json` | validation failure |

Compare against the corrected graph in `valid/`.

## No external documentation required

You do not need access to Pathable internal docs, CoachBridge production data, or Notion to understand or validate this example. The graph fixtures and `summary.md` output are sufficient for offline comprehension.
