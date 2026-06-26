# Check local primitive graphs

**Release:** [docs/releases/v0.md](../releases/v0.md)

One GitHub Milestone should correspond to this document. The GitHub Milestone
description should link here and to the parent release definition. GitHub
Milestones track issues; this document carries the planning intent and
acceptance contract.

## Goal

Deliver `specable check` as the primary offline entry point: validate local
JSON primitive fixture graphs, report relationship integrity issues, and
generate deterministic Markdown summaries and JSON reports.

## Why this matters

This vertical slice is SpecAble v0. Without trustworthy local validation and
integrity reporting, summaries and downstream agent workflows would amplify bad
product data instead of clarifying product state.

## Demo

From the repository root after `pnpm build`:

```sh
# Valid synthetic graph — exit 0, summary preview on stdout
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid

# Write artifacts to a directory
pnpm --filter @specable/cli exec specable check packages/cli/examples/generic/valid --out /tmp/specable-demo

# Inspect outputs
ls /tmp/specable-demo
# summary.md  validation.json  integrity-report.json
```

Show a fixture with Active validation failures (exit `1`) and one with integrity
warnings only (exit `0`). Use bundled examples under `packages/cli/examples/` and
`packages/cli/test/fixtures/` — synthetic data only.

## Expected result

After the demo:

- `specable check <dir>` runs fully offline against a JSON fixture folder
- Validation distinguishes Draft warnings from Active failures
- Integrity findings appear for orphans, duplicate names, story triples, and
  related graph heuristics without duplicating Active validation failures
- Stdout shows validation status and a short summary preview; `--out` writes
  deterministic artifacts
- Exit codes follow the v0 policy (`0` / `1` / `2`)

## User-visible or agent-visible behavior

- CLI prints validation pass/fail summary and integrity finding counts
- Active failures list primitive ID, type, and missing field or relationship
- Integrity warnings identify duplicate names, likely duplicates, orphans, and
  workflow derivability gaps with enough context to fix the graph
- Summary preview highlights Active objectives, workflows, capabilities, derived
  stories, and known modeling gaps
- `--out` produces `summary.md`, `validation.json`, and `integrity-report.json`
  suitable for CI artifacts and agent consumption

## Acceptance criteria

- [ ] `specable check` on the generic valid example exits `0` with no Active failures
- [ ] A fixture with Active validation failures exits `1` and reports actionable errors
- [ ] Fixture decode errors exit `2` with file path and field context
- [ ] Integrity warnings alone (e.g., duplicate normalized names) do not cause exit `1`
- [ ] `--out <dir>` writes deterministic `summary.md` and JSON reports for the same input
- [ ] Bundled generic and CoachBridge-inspired examples run without extra setup
- [ ] Demo completed using only synthetic fixture data

## Scope

- JSON fixture loading and graph indexing for all nine v0 primitive types
- Status-aware validation (`Draft` / `Active` / `Deprecated`)
- Integrity reporting (orphans, duplicates, story triples, derivability)
- Markdown summary and JSON report generation
- `specable check` CLI with stdout default and `--out` artifact writing
- Exit code policy and bundled synthetic examples

## Out of scope

- MCP server, hosted graph API, or Notion write-back
- YAML fixtures
- Product Experience Context, design handoff, or roadmap tooling
- Publishing mechanics beyond what the parent release already tracks

## Dependencies

- Repository bootstrap, Effect CLI scaffolding, and domain schemas (largely complete)
- Canonical Product Primitives relationship rules encoded in validation engine

## Inputs to Spec Kit

> **Canonical input for `/speckit-specify`.** Other sections in this document
> provide supporting context for humans and reviewers only. When creating the
> Spec Kit feature spec, use this section as the direct source material.

### Build

Build SpecAble v0: a local-first, open-source product primitive graph CLI
(`@specable/cli`) that validates JSON fixture graphs against the canonical
Product Primitives ontology, reports relationship integrity issues, and generates
deterministic Markdown summaries and JSON reports via `specable check`.

### Users / actors

- Product owners and engineers maintaining local primitive fixture files
- Contributors running validation in CI or locally before review
- Coding agents consuming `validation.json`, `integrity-report.json`, and
  `summary.md` as structured outputs

### Required behavior

- `specable check <dir>` validates all supported primitive types in a local
  JSON fixture folder without network access
- Draft primitives with incomplete relationships produce warnings; Active
  primitives with missing required fields or canonical relationships produce
  validation failures
- Broken references to unknown primitive IDs are validation failures
- Integrity report covers orphans, duplicate normalized names, likely duplicates,
  duplicate Active story triples, and workflow derivability gaps; Active
  under-linked failures stay in validation output only
- Default output goes to stdout (status + summary preview); `--out <dir>` writes
  `summary.md`, `validation.json`, and `integrity-report.json`
- Exit `0` when no Active validation failures or broken references; exit `1` on
  Active failures or broken references; exit `2` on usage, runtime, or decode errors
- Integrity warnings alone must not cause exit `1`
- Summary output is deterministic for the same fixture graph
- Ship generic and CoachBridge-inspired synthetic example graphs

### Constraints

- JSON-only fixtures for v0 (no YAML)
- Offline runtime: no Notion, MCP, cloud, or authentication dependencies
- Synthetic data only in examples and documentation
- Model the full nine-type ontology without a reduced divergent relationship model
- Effect v3 patterns; typed errors; no secrets or production data in fixtures

### Non-goals

- Notion/Confluence/Linear/Jira/GitHub/Figma integration or write-back
- MCP adapter or hosted evaluation service
- Product Experience Context, Design Impact Review, or design artifact pipelines
- Automated roadmap or implementation task generation beyond Spec Kit downstream

### Success definition

A reviewer can run the demo commands on bundled synthetic examples, observe
correct exit codes and artifact output, and confirm the Spec Kit spec at
`specs/001-product-primitives-v0/` acceptance scenarios are satisfied by the
implementation and test suite.

## Links

- Release: [docs/releases/v0.md](../releases/v0.md)
- GitHub Milestone: TBD
- Spec Kit spec: `specs/001-product-primitives-v0/`
- Issues: TBD

## Risks or blockers

- Existing `specs/001-product-primitives-v0/` predates formal milestone docs;
  treat this milestone document as the planning contract and align the spec
  rather than duplicating divergent requirements

## Completion evidence

- [ ] Demo completed as described above
- [ ] Acceptance criteria satisfied
- [ ] Related GitHub issues closed
- [ ] `pnpm test`, `pnpm check`, and example `specable check` runs pass in CI
