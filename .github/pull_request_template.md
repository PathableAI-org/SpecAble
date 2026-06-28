## Summary

<!-- What does this PR change and why? -->

## Changeset

Most pre-release PRs do **not** need a changeset. Add one when this PR changes shipped behavior or introduces a headline user-facing feature:

- [ ] I added a changeset (`pnpm changeset`) when required — or this PR does not need one (see [`.changeset/README.md`](../.changeset/README.md))
- [ ] I did **not** merge the bot's **Version Packages** PR (maintainers only, at MVP)

See [`.changeset/README.md`](../.changeset/README.md) for when to add and how to write release notes.

## Verification

```sh
pnpm codegen && pnpm check && pnpm lint && pnpm test
```
