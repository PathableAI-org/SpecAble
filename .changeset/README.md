# Changesets workflow

SpecAble uses [Changesets](https://github.com/changesets/changesets) to record release notes and semver bumps for `@specable/domain`, `@specable/core`, and `@specable/cli`. We are **pre-MVP**: changeset files accumulate on `main`, but no versioning or npm publish runs until maintainers deliberately start the alpha line.

## When to add a changeset

Most PRs do **not** need a changeset—especially before the first npm release. Add one only when the PR meets at least one of these criteria:

1. **Shipped behavior changed** — the PR changes a command, flag, output format, or public API that users already have from a published release (post-first alpha cut).
2. **Headline user-facing feature** — the PR introduces a capability worth calling out in release notes (new CLI command, new inspect surface, notable schema addition)—even pre-first-release if it should appear in the v0 launch changelog.
3. **Breaking public API** — the PR breaks the public API of `@specable/domain`, `@specable/core`, or `@specable/cli`.

**Skip a changeset** for pre-release scaffolding, refactors, tests, CI, internal module layout, incremental milestone work that does not change what a user can do, or Spec Kit task/phase progress (track those in `specs/` and issues, not here).

To add a changeset:

```sh
pnpm changeset
```

## How to write release notes

Changesets are **product news** for people browsing the repo and reading changelogs—not an audit trail for Spec Kit workflow.

Write for someone who understands SpecAble (commands, primitives, project roots) but not internal planning:

- Lead with **what users can do differently** or **what output changed**.
- Name commands and flags in backticks.
- Avoid phase numbers, task IDs (`T0xx`), user-story labels (`USn`), milestone slugs, and internal service names unless they are the public API.
- Use honest semver: `patch` for fixes and small tweaks, `minor` for additive features, `major` for breaking public API.
- Include each affected publishable package in the frontmatter (`@specable/domain`, `@specable/core`, `@specable/cli`).

**Avoid:**

> Add `specable primitive create` command and `PrimitiveService.create` orchestration (Phase 3, T017–T025).

**Prefer:**

> Add `specable primitive create` to create primitives in a configured project root.

**Avoid:**

> US3 summary/check output.

**Prefer:**

> `specable check` now writes deterministic Markdown summaries and supports `--summary-only` and `--out`.

## Phases

### 1. Pre-MVP (now): accumulate only

Add a changeset only when the PR changes shipped behavior or introduces a headline user-facing feature (see above). Most pre-release PRs skip this step.

Merged `.changeset/*.md` files stay on `main`. Package versions on `main` remain `0.0.0`; no `CHANGELOG.md` bumps land on `main`. The **Release** workflow (`.github/workflows/release.yml`) does **not** run on push to `main`.

No npm publish runs in this phase.

### 2. First alpha release (MVP)

When MVP is ready, maintainers run this **once** on `main`:

```sh
pnpm changeset-pre-enter-alpha
git add .changeset/pre.json
git commit -m "chore: enter alpha prerelease mode"
git push
```

This creates `.changeset/pre.json`. While it exists, `changeset version` produces versions like `0.1.0-alpha.0` and `changeset publish` uses the npm dist-tag `alpha` (not `latest`).

Then:

1. Manually run the **Release** workflow (`.github/workflows/release.yml` → *workflow_dispatch*).
2. Review the resulting **Version Packages** pull request (or direct version commit, depending on Actions permissions).
3. Merge the version bump (versions become `x.y.z-alpha.0`).
4. Run **Publish to npm** (`.github/workflows/publish.yml` → *workflow_dispatch*).

Subsequent alpha releases: add changesets in PRs → merge to `main` → dispatch Release → merge Version Packages PR → run publish workflow. Versions increment `alpha.0`, `alpha.1`, …

### 3. Stable release (post-alpha)

When alpha is complete:

```sh
pnpm changeset-pre-exit
pnpm changeset-version
git add -A
git commit -m "chore: exit alpha prerelease mode"
```

Merge that commit, then publish. Versions drop the `-alpha.N` suffix (e.g. `1.0.0`) and publish to the `latest` dist-tag.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm changeset` | Add a changeset (interactive) |
| `pnpm changeset-version` | Apply changesets locally (`changeset version`) |
| `pnpm changeset-pre-enter-alpha` | Enter alpha prerelease mode |
| `pnpm changeset-pre-exit` | Exit prerelease mode |
| `pnpm changeset-publish` | Build, test, publish to npm |

## Why not prerelease mode on `main` from day one?

Changesets [documents](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) that running prerelease mode on the default branch without a separate stable line can block normal versioning until you exit. Prerelease mode controls version **format** (`-alpha.N`), not whether versioning runs at all.

For a greenfield package at `0.0.0`, we instead:

1. Accumulate `.changeset/*.md` files on `main` with no release CI.
2. Enter `alpha` only at the MVP cut, then dispatch Release manually.
3. Publish manually via workflow dispatch until we enable automatic publish after alpha stabilizes.

When dispatching Release, you may need **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**, or a `PAT` secret, for the Version Packages PR pattern.

## Snapshot releases (optional)

For one-off CI installs without semver bumps, Changesets [snapshot releases](https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md) (`changeset version --snapshot`) are available. A pkg.pr.new PR preview workflow is deferred until maintainers need it; do not merge snapshot version bumps to `main`.
