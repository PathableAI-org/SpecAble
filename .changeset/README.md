# Changesets workflow

SpecAble uses [Changesets](https://github.com/changesets/changesets) to record release notes and semver bumps for `@specable/cli`. We are **pre-MVP**: changeset files accumulate on `main`, but no versioning or npm publish runs until maintainers deliberately start the alpha line.

## Phases

### 1. Pre-MVP (now): accumulate only

Contributors add a changeset with each publishable PR:

```sh
pnpm changeset
```

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
