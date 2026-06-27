---
name: "speckit-taskstoissues"
description: "Convert tasks.md phases into grouped GitHub issues (one issue per phase) with native blocked-by phase dependencies, optional milestone attachment, and deduplication on re-run."
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

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse `FEATURE_DIR` and `AVAILABLE_DOCS` list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. **IF EXISTS**: Load `.specify/memory/constitution.md` for project principles and governance constraints.
1. From the executed script, extract the path to **tasks** (`tasks.md`).
1. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. **Parse `tasks.md` into phases** (do **not** create one issue per task):

   **Feature name**: Read from the `# Tasks: …` heading (first H1). Example: `Initialize JSON and SQLite Project Roots`.

   **Phase headings**: Match lines `## Phase {n}: {title}` (e.g. `## Phase 2: Foundational (Blocking Prerequisites)`). For each phase, collect until the next `## Phase` heading or `## Dependencies & Execution Order` (whichever comes first).

   **Per phase, extract**:
   - `phaseNumber` (integer)
   - `phaseTitle` (text after `Phase {n}:`)
   - `purpose` — from `**Purpose**:` line when present
   - `goal` — from `**Goal**:` line when present
   - `independentTest` — from `**Independent Test**:` when present
   - `checkpoint` — from `**Checkpoint**:` line when present
   - `tasks` — every checkbox line `- [ ] T### …` or `- [x] T### …` in that phase (preserve exact wording, `[P]`, `[US#]`, and checked state)

   **Issue title format** (one issue per phase):

   ```text
   Phase {n}: {phaseTitle} — {featureName}
   ```

   Example: `Phase 2: Foundational (Blocking Prerequisites) — Initialize JSON and SQLite Project Roots`

   **Issue body template**:

   ```markdown
   ## Context

   - Feature: {FEATURE_DIR as repo-relative path, e.g. specs/002-initialize-project-roots/}
   - Phase: {n} — {phaseTitle}

   ## Purpose

   {purpose or "See tasks below."}

   ## Goal

   {goal if present}

   ## Independent Test

   {independentTest if present}

   ## Tasks

   {copy phase task checkboxes verbatim — one line per T### item}

   ## Checkpoint

   {checkpoint if present}

   ## Notes

   Complete all tasks in this issue before starting phases that are **blocked by** this issue. Within-phase ordering and `[P]` parallel hints are defined in `tasks.md` under **Dependencies & Execution Order**.
   ```

1. **Fetch existing issues for deduplication**: Before creating anything, list issues on the remote repo (open and closed). Prefer the GitHub MCP server's `list_issues` tool when available; otherwise use `gh issue list --repo {owner}/{repo} --limit 100 --json number,title,state` (paginate as needed). Do not pass `state` to MCP `list_issues` — omitting it returns both open and closed issues.

   **Match existing phase issues** by title prefix:

   ```text
   Phase {n}: … — {featureName}
   ```

   Use a case-sensitive match on `Phase {n}:` at the start of the title **and** the feature suffix `— {featureName}` at the end. Skip creation when a matching issue already exists; report `Phase {n} already has issue #{number}, skipping`.

   > **Legacy per-task issues**: Older runs may have created `T001: …` issues. Do **not** treat those as phase issues. New runs create phase-grouped issues only. Mention legacy per-task issues in the completion report if the same milestone still contains them.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

1. **Create phase issues**: For each phase without a matching issue, create one issue. Prefer the GitHub MCP server when available; otherwise:

   ```bash
   gh issue create --repo {owner}/{repo} \
     --title "Phase {n}: {phaseTitle} — {featureName}" \
     --body "$(cat <<'EOF'
   …body from template…
   EOF
   )"
   ```

1. **Attach milestone (when requested or configured)**: If the user provides a milestone URL/number, or the feature plan/milestone doc names a GitHub milestone, attach all created phase issues using:

   ```bash
   gh api repos/{owner}/{repo}/issues/{issue_number} -X PATCH -f milestone={milestone_number}
   ```

1. **Create phase-level blocked-by relationships (native GitHub issue dependencies)**: After phase issues exist, wire **direct** `blocked by` edges between **phases** (not individual tasks). Use GitHub's native **Relationships** field ([issue dependencies](https://github.blog/changelog/2025-08-21-dependencies-on-issues/)), not issue body text or markdown task-list checkboxes for cross-phase ordering.

   **Semantics**:
   - **Blocked by**: the dependent phase issue cannot start until the blocking phase issue is complete. In the UI: open the dependent issue → **Relationships** → **Blocked by** → select the prerequisite phase issue.
   - **Blocks**: the inverse view on the prerequisite issue (same edge; one `addBlockedBy` call establishes both).

   **When to run**: After all phase issues are created (or deduplication confirms they exist). Re-run safely: skip edges that already exist.

   **Derive the phase dependency graph from `tasks.md`**:

   1. Read `## Dependencies & Execution Order` → `### Phase Dependencies` and any phase-dependency diagram or bullet list under it.
   2. Build **direct** phase-to-phase blockers only (transitive closure is implicit):
      - **Default** when the section is sparse: Phase 1 has no blockers; Phase *n* (*n* > 1) is **blocked by** Phase *n − 1*.
      - **Override from explicit text** (examples):
        - "Foundational (Phase 2) … BLOCKS all user stories" → Phase 3+ blocked by Phase 2 (not necessarily by Phase 1 directly).
        - "User Story 2 (Phase 4) … Depends on Foundational" → Phase 4 blocked by Phase 2; add Phase 3 as blocker when the doc says US2 needs US1 roots or the diagram shows US2 after US1.
        - "User Story 3 (Phase 5) … Depends on US1 + US2" → Phase 5 blocked by Phase 4 (if US2 follows US1 sequentially); add Phase 3 as an additional direct blocker only when the doc requires both independently.
        - "Polish (Final Phase) … Depends on all desired user stories" → Phase 6 blocked by the **last** user-story phase in the chain (typically Phase 5), not every earlier phase.
   3. Do **not** wire task-level `T###` chains as separate issue dependencies — those live inside the phase issue checklist.
   4. Encode **at most one primary sequential blocker** per phase unless the doc names multiple explicit prerequisites (e.g. US3 blocked by both US1 and US2 phases when truly parallel prerequisites exist).

   **Example graph** (from a typical SpecAble `tasks.md`):

   ```text
   Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
   ```

   Direct edges: P2 blocked by P1; P3 blocked by P2; P4 blocked by P3; P5 blocked by P4; P6 blocked by P5.

   **Map phase numbers to issue numbers**: Lookup from created or existing issues matching `Phase {n}: … — {featureName}`.

   **Preferred API — GraphQL `addBlockedBy`** (requires global node IDs, not issue numbers):

   ```bash
   # 1. Fetch node_id for each issue
   gh api repos/{owner}/{repo}/issues/{issue_number} --jq .node_id

   # 2. Add edge: {blocked_phase_issue} is blocked by {blocking_phase_issue}
   gh api graphql -f query='
   mutation($issueId: ID!, $blockingIssueId: ID!) {
     addBlockedBy(input: {issueId: $issueId, blockingIssueId: $blockingIssueId}) {
       issue { number issueDependenciesSummary { blockedBy totalBlockedBy } }
       blockingIssue { number issueDependenciesSummary { blockedBy totalBlocking } }
     }
   }' -f issueId="{BLOCKED_NODE_ID}" -f blockingIssueId="{BLOCKING_NODE_ID}"
   ```

   - `issueId`: the **dependent** phase issue (cannot start yet).
   - `blockingIssueId`: the **prerequisite** phase issue (must complete first).

   **Alternative — REST API**:

   ```bash
   POST /repos/{owner}/{repo}/issues/{blocked_issue_number}/dependencies/blocked_by
   Body: { "issue_id": <numeric_database_id> }
   ```

   Use the issue's numeric **id** field from `gh api repos/{owner}/{repo}/issues/{number}`, not the issue **number**.

   **Tooling fallback**: If the GitHub MCP server is unavailable or lacks `addBlockedBy`, use `gh api graphql` as above. Do not substitute markdown cross-references in issue bodies for native dependencies.

   **Verify** (sample dependent phase):

   ```bash
   gh api graphql -f query='
   query {
     repository(owner: "{owner}", name: "{repo}") {
       issue(number: {n}) {
         issueDependenciesSummary { blockedBy totalBlockedBy totalBlocking }
         blockedBy(first: 20) { nodes { number title } }
         blocking(first: 20) { nodes { number title } }
       }
     }
   }'
   ```

   **Search filters** (for humans/agents after wiring): `is:blocked`, `is:blocking`, `blocked-by:{issue_number}`, `blocking:{issue_number}`.

   **Report**: Count of phase edges created, skipped (already exist), and failed. Note entry-point phases with `blockedBy: 0` (typically Phase 1).

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
- Phase issues created vs skipped (deduplication), with issue numbers and titles
- Task count per phase (not issue count per task)
- Milestone attached (if any)
- Phase-level blocked-by / blocks edges created vs skipped vs failed
- Entry-point phase with no blockers (typically Phase 1)
- Link to milestone or filtered issue list when applicable
- Note any legacy per-task (`T###:`) issues on the same milestone that may need manual cleanup
