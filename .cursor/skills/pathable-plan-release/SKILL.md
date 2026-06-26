---
name: "pathable-plan-release"
description: "Create a release planning document at docs/releases/<slug>.md from the PathAble release template."
compatibility: "Requires docs/_templates/releases/release-template.md (vendored from PathableAI-org/.github)"
metadata:
  author: "pathable"
  source: "docs/_templates/releases/release-template.md"
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Writing Standards

Apply these standards when filling the release document (derived from the PathAble Open Source Operating Model):

- Vertical slices are the smallest **demoable product capability**, not calendar checkpoints or architecture layers.
- Good slice name: "validate local primitive graphs from the CLI". Bad slice name: "implement the database layer".
- Describe user- or agent-**visible behavior**, not internal design.
- Use synthetic data only in examples.
- Slugs: lowercase kebab-case (for example: `v0`, `alpha`, `product-primitives-v0`).
- One GitHub Milestone per milestone document (documented later via `/pathable-plan-milestone`; not created by this skill).

## Outline

The text the user typed after `/pathable-plan-release` **is** the release description. Assume it is available even if `$ARGUMENTS` appears literally below. Do not ask the user to repeat it unless they provided an empty command.

### 1. Parse arguments

From `$ARGUMENTS`, extract:

- **Release description** (required free text): everything not consumed by flags.
- **`--slug <release-slug>`** (optional): explicit lowercase kebab-case slug.
- **`--status Draft|In progress|Shipped`** (optional): default `Draft`.
- **`--allow-existing`** (optional): allow overwriting or updating an existing `docs/releases/<slug>.md` when the user explicitly requests it.

If release description is empty after parsing flags: **ERROR** "No release description provided".

### 2. Pre-execution checks

1. Resolve repository root: directory containing `.specify/` or `AGENTS.md`.
2. Verify `docs/_templates/releases/release-template.md` exists. If missing: **ERROR** "Release template not found at docs/_templates/releases/release-template.md".
3. Derive `RELEASE_SLUG` if `--slug` omitted:
   - Extract 2–4 meaningful keywords from the description.
   - Produce lowercase kebab-case (for example: "SpecAble v0 product primitives" → `v0` or `product-primitives-v0`).
   - Prefer short, recognizable slugs when the user names a version (for example: `v0`, `alpha`).
4. Set `RELEASE_FILE` to `docs/releases/<RELEASE_SLUG>.md`.
5. If `RELEASE_FILE` exists and `--allow-existing` was **not** passed: **ERROR** "Release file already exists: docs/releases/<RELEASE_SLUG>.md. Pass --allow-existing to update."

### 3. Load context

Read before writing (skip gracefully if missing):

- `README.md`
- `docs/vision/*` (any files under `docs/vision/`)
- `.specify/memory/constitution.md`
- Existing `docs/releases/*.md` (avoid duplicate scope)
- If the user indicates this release covers existing work, skim relevant `specs/*/spec.md` files for alignment (do not copy implementation detail into the release doc)

### 4. Clarification (max 5 questions)

Ask only when critical information is missing and cannot be inferred from context. Prioritize:

1. Release goal (one paragraph capability outcome)
2. Release thesis (why this release matters)
3. Target users / usage mode
4. In-scope vs out-of-scope boundaries
5. Observable success criteria
6. Ordered **vertical-slice names** with one-line demo summaries (capability-oriented)

Use the speckit-clarify interaction pattern: present all questions together, wait for answers, then proceed. If the user provided a rich description, skip clarification.

**LIMIT**: Maximum 5 clarification questions total.

### 5. Generate the release document

1. Read `docs/_templates/releases/release-template.md`.
2. Create `docs/releases/` if needed.
3. Write `RELEASE_FILE` by:
   - Preserving template section order and headings exactly.
   - **Removing** the HTML comment instruction block at the top (and any trailing template-only comments).
   - Replacing `<Release name>` with the human-readable release name.
   - Setting **Status** to the parsed `--status` value (default `Draft`).
   - Replacing all `REPLACE_ME` and empty placeholder bullets with concrete content.
   - Filling **Vertical slice milestone list** with numbered items: milestone **names** and one-line demo summaries. Do **not** add `docs/milestones/...` links yet (milestone docs may not exist).
   - Resolving open questions where possible; leave only genuinely unsettled decisions.
   - Using `TBD` in **Links** only for URLs or external references not yet known.

**Generation rules:**

- No `REPLACE_ME` may remain in the output.
- No `<...>` angle-bracket placeholders may remain (except none should remain at all).
- Scope and out-of-scope sections must have at least one concrete bullet each.

### 6. Self-validation

Before reporting completion, verify:

- [ ] `RELEASE_FILE` exists at the correct path
- [ ] HTML template comment blocks removed
- [ ] No `REPLACE_ME` remains
- [ ] Vertical slices describe product capabilities, not architecture layers
- [ ] Success criteria are observable and testable

If validation fails, fix the document and re-check (max 3 iterations).

## Out of Scope (v1)

- Do **not** create GitHub Releases, Milestones, or issues.
- Do **not** create milestone documents (use `/pathable-plan-milestone` instead).
- Do **not** wire Spec Kit extension hooks.

## Completion Report

Report completion to the user with:

1. **Created file**: `docs/releases/<RELEASE_SLUG>.md`
2. **Release name** and **status**
3. **Vertical slices** listed (names only)
4. **Suggested next steps**:
   - Run `/pathable-plan-milestone --release <RELEASE_SLUG> <description>` for each vertical slice
   - When the release ships, summarize what actually shipped in a GitHub Release and link back to this definition
5. **Reminder**: This document is the public planning contract; GitHub Release summaries come at ship time.

## Done When

- [ ] Release document written to `docs/releases/<RELEASE_SLUG>.md` and self-validated
- [ ] Completion report delivered with next-step guidance for milestone planning
