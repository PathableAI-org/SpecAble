# Generic Scheduling Example

Domain-neutral Product Primitive graph demonstrating appointment scheduling without Pathable- or CoachBridge-specific context.

## Layout

| Directory | Purpose |
|-----------|---------|
| `valid/` | Corrected graph with all nine primitive types and canonical relationships |
| `invalid/` | Common mistake patterns to compare against `valid/` |

## Usage

From the repository root (after `pnpm build`):

```bash
# Full check: validation + integrity + summary preview
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/valid

# Scoped modes
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/valid --validate-only
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/valid --integrity-only
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/valid --summary-only

# Write shareable artifacts
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/valid --out /tmp/specable-generic-out

# Invalid variant (expect exit code 1)
node packages/cli/build/esm/bin.js check packages/cli/examples/generic/invalid
```

## Mistake patterns in `invalid/`

| Pattern | Where to look | Severity |
|---------|---------------|----------|
| Draft incompleteness | `obj-draft-explore` in `objectives.json` | validation warning |
| Active missing required field | `actor-provider` missing `description` in `actors.json` | validation failure |
| Duplicate story triple | `story-book-appointment` and `story-book-appointment-alt` in `stories.json` | validation failure |
| Missing capability concept link | `cap-book-appointment` without `domainConcepts` and empty `capability-concept-links.json` | validation failure |

Compare each mistake against the corrected counterpart in `valid/`.

## Comprehension checklist (SC-005)

After running `check` with `--out` on `valid/` and reading `summary.md`, you should be able to answer:

### 1. Name four primitive types present in the graph.

**Answer**: Objective, Actor, Persona, Capability (also present: Domain Concept, Capability Concept Link, Expected Result, Workflow, Story).

### 2. Identify two relationships.

**Answer examples**:

- Persona → Primary Actor: `persona-busy-professional` links to `actor-customer` via `primaryActors`.
- Story → Capability: `story-book-appointment` links to `cap-book-appointment` via `capability`.

Other valid answers: Capability → Domain Concept, Workflow → Objective, Expected Result → Capability.

### 3. Explain the difference between Draft and Active validation behavior.

**Answer**: Draft primitives produce validation **warnings** for incomplete fields or missing relationships, allowing work-in-progress modeling. Active primitives produce validation **failures** for missing required fields or relationships, which cause `specable check` to exit with code `1`. See `invalid/objectives.json` (`obj-draft-explore`, Draft) versus `valid/objectives.json` (Active objective with full fields).

### 4. Point to where modeling gaps would appear if present.

**Answer**: The **Known Modeling Gaps** section at the end of `summary.md` (and in the summary preview on stdout). Active validation failures appear under the **Failures** subsection; Draft warnings appear under **Warnings**. Run `check` on `invalid/` to see populated gap sections.
