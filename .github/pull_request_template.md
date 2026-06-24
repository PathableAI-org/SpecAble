## Summary

<!-- What does this PR change and why? -->

## Changeset

Publishable changes to `@specable/cli` need a changeset so release notes accumulate on `main`:

- [ ] I added a changeset (`pnpm changeset`) — or this PR has no publishable changes
- [ ] I did **not** merge the bot's **Version Packages** PR (maintainers only, at MVP)

See [`.changeset/README.md`](../.changeset/README.md) for the release workflow.

## Verification

```sh
pnpm codegen && pnpm check && pnpm lint && pnpm test
```
