---
name: "pathable-plan-milestone"
description: "Create a milestone planning document at docs/milestones/<slug>.md from the PathAble milestone template, linked to a parent release."
compatibility: "Requires docs/_templates/milestones/milestone-template.md and an existing docs/releases/<release-slug>.md"
metadata:
  author: "pathable"
  source: "docs/_templates/milestones/milestone-template.md"
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Writing Standards

Apply these standards when filling the milestone document (derived from the PathAble Open Source Operating Model):

- A milestone is the smallest **demoable product capability** being built next—not a calendar checkpoint or architecture layer.
- Good slug: `validate-desired-state`, `check-local-graphs`. Bad slug: `database-layer`, `week-3`.
- Describe user- or agent-**visible behavior**, not internal design.
- Use synthetic data only in demos and examples.
- Slugs: lowercase kebab-case, behavior-oriented.
- The **Inputs to Spec Kit** section is the canonical source for `/speckit-specify`; it must be complete enough to use without re-deriving requirements from other sections.
- One GitHub Milestone per milestone document (description printed for manual copy; not created by this skill).

## Outline

The text the user typed after `/pathable-plan-milestone` **is** the milestone description (after flags). Assume it is available even if `$ARGUMENTS` appears literally below.

### 1. Parse arguments

From `$ARGUMENTS`, extract:

- **`--release <release-slug>`** (required): parent release slug matching `docs/releases/<release-slug>.md`.
- **Milestone description** (required free text): everything not consumed by flags.
- **`--slug <milestone-slug>`** (optional): explicit lowercase kebab-case, behavior-oriented slug.
- **`--allow-existing`** (optional): allow updating an existing `docs/milestones/<slug>.md` when explicitly requested.

If `--release` is missing: **ERROR** "Missing required flag: --release <release-slug>".

If milestone description is empty after parsing flags: **ERROR** "No milestone description provided".

### 2. Pre-execution checks

1. Resolve repository root: directory containing `.specify/` or `AGENTS.md`.
2. Set `RELEASE_SLUG` from `--release`.
3. Verify `docs/releases/<RELEASE_SLUG>.md` exists. If missing: **ERROR** "Parent release not found: docs/releases/<RELEASE_SLUG>.md. Run /pathable-plan-release first."
4. Verify `docs/_templates/milestones/milestone-template.md` exists. If missing: **ERROR** "Milestone template not found at docs/_templates/milestones/milestone-template.md".
5. Derive `MILESTONE_SLUG` if `--slug` omitted:
   - Extract 2–4 meaningful keywords from the milestone description.
   - Produce lowercase kebab-case, behavior-oriented (for example: "validate local graphs" → `check-local-graphs`).
6. Set `MILESTONE_FILE` to `docs/milestones/<MILESTONE_SLUG>.md`.
7. If `MILESTONE_FILE` exists and `--allow-existing` was **not** passed: **ERROR** "Milestone file already exists: docs/milestones/<MILESTONE_SLUG>.md. Pass --allow-existing to update."

### 3. Load context

Read before writing:

- Parent release: `docs/releases/<RELEASE_SLUG>.md` (goal, thesis, scope, vertical-slice list)
- Sibling milestones: `docs/milestones/*.md` (avoid overlap; align sequencing)
- `.specify/memory/constitution.md` if present
- Existing `specs/*/` directories: if a spec already exists for this milestone scope, note it for the completion report (suggest update vs new spec)

### 4. Clarification (max 5 questions)

Ask only when critical information is missing. Prioritize:

1. Demo script (commands, walkthrough, synthetic data)
2. Acceptance criteria framed around the demo
3. Observable user/agent-visible behavior
4. **Inputs to Spec Kit** subsections: Build, Users/actors, Required behavior, Constraints, Non-goals, Success definition

Present all questions together; wait for answers. Skip if the user description is already sufficient.

**LIMIT**: Maximum 5 clarification questions total.

### 5. Generate the milestone document

1. Read `docs/_templates/milestones/milestone-template.md`.
2. Create `docs/milestones/` if needed.
3. Write `MILESTONE_FILE` by:
   - Preserving template section order and headings exactly.
   - **Removing** HTML comment instruction blocks (top and bottom suggested GitHub Milestone block).
   - Replacing `<Milestone name>` with the human-readable milestone name.
   - Setting **Release** link to `[docs/releases/<RELEASE_SLUG>.md](../releases/<RELEASE_SLUG>.md)`.
   - Replacing all `REPLACE_ME` with concrete content.
   - Filling **Inputs to Spec Kit** completely—this section must stand alone as input to `/speckit-specify`.
   - Framing **Acceptance criteria** as demo-verifiable checkboxes.
   - In **Links**: fill release link; use `TBD` for GitHub Milestone URL, Spec Kit spec path, and Issues when unknown.
   - In **Dependencies**: use "None identified" only when truly none; otherwise list concrete dependencies.

**Generation rules:**

- No `REPLACE_ME` may remain in the output.
- No `<...>` angle-bracket placeholders may remain.
- **Inputs to Spec Kit** must not defer to other sections ("see above"); include the requirements inline.

### 6. Self-validation

Before reporting completion, verify:

- [ ] `MILESTONE_FILE` exists at the correct path
- [ ] HTML template comment blocks removed
- [ ] No `REPLACE_ME` remains
- [ ] Release cross-link uses correct relative path
- [ ] **Inputs to Spec Kit** is self-contained for `/speckit-specify`
- [ ] Acceptance criteria align with the demo

If validation fails, fix and re-check (max 3 iterations).

## Out of Scope (v1)

- Do **not** edit the parent release's vertical-slice list to add markdown links.
- Do **not** create GitHub Milestones or issues via CLI.
- Do **not** run `/speckit-specify` automatically.

## Completion Report

Report completion to the user with:

### 1. Created file

- `docs/milestones/<MILESTONE_SLUG>.md`
- Milestone name and parent release slug

### 2. Suggested GitHub Milestone description (copy block)

```text
Goal: <one sentence from milestone Goal section>

Demo: <one sentence from milestone Demo section>

Definition: docs/milestones/<MILESTONE_SLUG>.md

Release: docs/releases/<RELEASE_SLUG>.md

First issue: Create Spec Kit spec, plan, and tasks for <Milestone name>.
```

### 3. Suggested setup issue

**Title:** `Create Spec Kit spec, plan, and tasks for <Milestone name>`

**Body:**

```markdown
## Context

- Release: docs/releases/<RELEASE_SLUG>.md
- Milestone: docs/milestones/<MILESTONE_SLUG>.md

## Checklist

- [ ] Read the release definition
- [ ] Read the milestone definition
- [ ] Run `/speckit-specify` using the milestone **Inputs to Spec Kit** section as canonical source material
- [ ] Run `/speckit-plan`
- [ ] Run `/speckit-tasks`
- [ ] Run `/speckit-taskstoissues` (creates one GitHub issue per `tasks.md` phase, with native blocked-by dependencies between phases)
```

### 4. Next steps

- Manually create the GitHub Milestone using the description above.
- Open the setup issue using the title and body above.
- After the setup issue exists, run `/speckit-specify` with content from **Inputs to Spec Kit**.
- If `specs/*` already covers this scope, note whether to update the existing spec or create a new feature directory.

## Done When

- [ ] Milestone document written to `docs/milestones/<MILESTONE_SLUG>.md` and self-validated
- [ ] Completion report includes GitHub Milestone description and setup issue copy blocks
