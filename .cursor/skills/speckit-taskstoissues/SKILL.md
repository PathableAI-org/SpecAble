---
name: "speckit-taskstoissues"
description: "Convert tasks.md into GitHub issues with native blocked-by dependencies, optional milestone attachment, and deduplication on re-run."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/taskstoissues.md"
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks-to-issues conversion)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_taskstoissues` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. **IF EXISTS**: Load `.specify/memory/constitution.md` for project principles and governance constraints.
1. From the executed script, extract the path to **tasks**.
1. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. **Fetch existing issues for deduplication**: Before creating anything, build the set of task IDs you are about to process from `tasks.md` (each is a `T` followed by three digits, e.g. `T001`). Prefer the GitHub MCP server's `list_issues` tool when available; otherwise use `gh issue list --repo {owner}/{repo} --limit 100 --json number,title,state` (paginate with `--search` or higher `--limit` as needed). Do not pass a `state` value to MCP `list_issues`, since omitting it returns both open and closed issues. Request `perPage: 100` for MCP and paginate with `after` / `endCursor`. For each issue title, match `\bT\d{3}\b` (word boundaries so `ST001` or `T0010` are not matched; recognises `T001 ...`, `T001: ...`, `[T001] ...`). Stop paginating once every task ID is matched or there are no more pages.
1. For each task in the list, create a new issue in the repository matching the Git remote. Prefer the GitHub MCP server when available; otherwise use `gh issue create --repo {owner}/{repo} --title "T001: <description>" --body "..."`. Task lines in `tasks.md` start with a markdown checkbox; strip `- [ ]` and any `[P]` / `[US#]` markers to recover the task ID and description. Title format: `T001: <description>` (e.g. `- [ ] T001 Create project structure` → `T001: Create project structure`).
   - **Skip** any task whose ID is already present in the set of existing issues from the previous step, and report it (for example, `T001 already has an issue, skipping`).
   - Only create issues for tasks that do not yet have a matching issue.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

1. **Attach milestone (when requested or configured)**: If the user provides a milestone URL/number, or the feature plan/milestone doc names a GitHub milestone, attach all created (and optionally setup) issues using:

```bash
gh api repos/{owner}/{repo}/issues/{issue_number} -X PATCH -f milestone={milestone_number}
```

1. **Create blocked-by relationships (native GitHub issue dependencies)**: After issues exist, wire **direct** `blocked by` edges so each task issue reflects `tasks.md` execution order. Use GitHub's native **Relationships** field ([issue dependencies](https://github.blog/changelog/2025-08-21-dependencies-on-issues/)), not issue body text or task-list checkboxes.

   **When to run**: After all task issues are created (or after deduplication confirms they exist). Re-run safely: skip edges that already exist.

   **Derive the dependency graph from `tasks.md`**:
   - Read **Phase Dependencies**, **Within Each User Story**, and **Parallel Opportunities** under `## Dependencies & Execution Order`.
   - Encode **direct** blockers only (transitive closure is implicit). Example: if T042 depends on T041, and T041 depends on T026, add `T042 blocked by T041` only—not every ancestor of T041.
   - Phase gates: tasks in Phase 2+ are typically blocked by the last task(s) of the prior phase (e.g. T008–T018 blocked by T007).
   - Intra-phase chains: e.g. T013/T014 blocked by T012; T015 blocked by T013 and T014.
   - Story chains: e.g. T023 blocked by T022; CLI registration after command implementation.
   - Do **not** add blockers for `[P]` parallel tasks unless `tasks.md` states an explicit ordering dependency.

   **Map task IDs to issue numbers**: Build a lookup from issue titles matching `\bT\d{3}\b` (canonical form `T001: <description>`). If issues were created in order without gaps, verify mapping via `gh issue list --search "T001 in:title"` rather than assuming numeric offsets.

   **Preferred API — GraphQL `addBlockedBy`** (requires global node IDs, not issue numbers):

```bash
# 1. Fetch node_id for each issue
gh api repos/{owner}/{repo}/issues/{issue_number} --jq .node_id

# 2. Add edge: {blocked_issue} is blocked by {blocking_issue}
gh api graphql -f query='
mutation($issueId: ID!, $blockingIssueId: ID!) {
  addBlockedBy(input: {issueId: $issueId, blockingIssueId: $blockingIssueId}) {
    issue { number issueDependenciesSummary { blockedBy totalBlockedBy } }
    blockingIssue { number }
  }
}' -f issueId="{BLOCKED_NODE_ID}" -f blockingIssueId="{BLOCKING_NODE_ID}"
```

   - `issueId`: the **blocked** issue (the dependent task that cannot start yet).
   - `blockingIssueId`: the **blocking** issue (the prerequisite that must complete first).
   - Semantics match the UI: open the blocked issue → **Relationships** → **Blocked by** → select the blocking issue.

   **Alternative — REST API**:

```bash
POST /repos/{owner}/{repo}/issues/{blocked_issue_number}/dependencies/blocked_by
Body: { "issue_id": <numeric_database_id> }
```

   Use the issue's numeric **id** field from `gh api repos/{owner}/{repo}/issues/{number}`, not the issue **number**.

   **Tooling fallback**: If the GitHub MCP server is unavailable or lacks `addBlockedBy`, use `gh api graphql` as above. Do not substitute markdown cross-references in issue bodies for native dependencies.

   **Verify**:

```bash
gh api graphql -f query='
query {
  repository(owner: "{owner}", name: "{repo}") {
    issue(number: {n}) {
      issueDependenciesSummary { blockedBy totalBlockedBy }
      blockedBy(first: 20) { nodes { number title } }
    }
  }
}'
```

   **Search filters** (for humans/agents after wiring): `is:blocked`, `is:blocking`, `blocked-by:{issue_number}`, `blocking:{issue_number}`.

   **Report**: Count of edges created, skipped (already exist), and failed. Note entry-point tasks with `blockedBy: 0` (typically T001).

## Post-Execution Checks

**Check for extension hooks (after tasks-to-issues conversion)**:
Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.after_taskstoissues` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Completion Report

Report to the user:
- Issues created vs skipped (deduplication)
- Milestone attached (if any)
- Blocked-by edges created vs skipped vs failed
- Entry-point tasks with no blockers (e.g. T001)
- Link to milestone or issues list when applicable
