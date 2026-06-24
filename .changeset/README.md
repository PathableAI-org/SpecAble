# Changesets workflow

SpecAble uses [Changesets](https://github.com/changesets/changesets) to record release notes and semver bumps for `@specable/cli`. We are **pre-MVP**: changes accumulate on `main`, but nothing is published to npm until maintainers deliberately start the alpha line.

## Phases

### 1. Pre-MVP (now): accumulate only

Contributors add a changeset with each publishable PR:

```sh
pnpm changeset
```

When changesets land on `main`, CI (`.github/workflows/release.yml`) opens or updates a **Version Packages** pull request. That PR:

- Applies pending changesets to `CHANGELOG.md`
- Bumps `packages/cli/package.json` version
- Deletes consumed `.changeset/*.md` files

**Do not merge the Version Packages PR until we are ready for the first alpha release.** While it stays open, more merges to `main` keep updating it with additional changesets. Package versions on `main` remain `0.0.0`.

No npm publish runs in this phase (`publish` is omitted from the Changesets action).

### 2. First alpha release (MVP)

When MVP is ready, maintainers run this **once** on `main` before merging the Version Packages PR:

```sh
pnpm changeset pre enter alpha
git add .changeset/pre.json
git commit -m "chore: enter alpha prerelease mode"
git push
```

This creates `.changeset/pre.json`. While it exists, `changeset version` produces versions like `0.1.0-alpha.0` and `changeset publish` uses the npm dist-tag `alpha` (not `latest`).

Then:

1. Merge the **Version Packages** PR (versions become `x.y.z-alpha.0`).
2. Run **Publish to npm** (`.github/workflows/publish.yml` → *workflow_dispatch*) or merge a follow-up that triggers publish.

Subsequent alpha releases: add changesets in PRs → merge to `main` → merge updated Version Packages PR → run publish workflow. Versions increment `alpha.0`, `alpha.1`, …

### 3. Stable release (post-alpha)

When alpha is complete:

```sh
pnpm changeset pre exit
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

Changesets [documents](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) that running prerelease mode on the default branch without a separate stable line can block normal versioning until you exit. For a greenfield package at `0.0.0`, we instead:

1. Accumulate `.changeset/*.md` files on `main` with version-only CI.
2. Enter `alpha` only at the MVP cut.
3. Publish manually via workflow dispatch until we enable automatic publish after alpha stabilizes.

## Snapshot releases (optional)

For one-off CI installs without semver bumps, Changesets [snapshot releases](https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md) (`changeset version --snapshot`) are available. Do not merge snapshot version bumps to `main`.
