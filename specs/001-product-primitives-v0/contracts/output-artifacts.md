# Output Artifact Contract

**Applies when**: `specable check --out <dir>`

## Files written

| File | Format | Required |
|------|--------|----------|
| `summary.md` | Markdown | yes |
| `validation.json` | JSON | yes |
| `integrity-report.json` | JSON | yes |
| `integrity-report.md` | Markdown | optional (recommended for human sharing) |
| `check-result.json` | JSON | optional combined envelope |

Default command without `--out` writes **no files**.

## `validation.json`

```json
{
  "schemaVersion": 1,
  "projectDir": "/path/to/graph",
  "passed": false,
  "failureCount": 1,
  "warningCount": 2,
  "findings": [
    {
      "severity": "failure",
      "code": "missing-relationship",
      "primitiveType": "Story",
      "primitiveId": "story-001",
      "field": "workflows",
      "message": "Active Story must link to at least one Workflow"
    }
  ]
}
```

Finding codes (non-exhaustive): `missing-field`, `missing-relationship`, `broken-reference`, `duplicate-id`, `duplicate-story-triple`, `invalid-enum`, `fixture-decode`.

## `integrity-report.json`

Same finding shape plus advisory codes: `likely-duplicate-name`, `disconnected-actor`, `implementation-shaped-domain-concept`, `vague-expected-result`, `missing-workflow-derivation`.

Includes `duplicateStoryTriples`:

```json
{
  "actorId": "actor-a",
  "capabilityId": "cap-b",
  "expectedResultId": "er-c",
  "storyIds": ["story-1", "story-2"]
}
```

## `summary.md`

Required sections (deterministic order):

1. `# Product Primitive Summary`
2. `## Active Objectives`
3. `## Workflows`
4. `## Actors and Personas`
5. `## Capabilities`
6. `## Domain Concepts`
7. `## Expected Results`
8. `## Stories`
9. `## Known Modeling Gaps`

Gap section subdivides **Failures** vs **Warnings**.

Story entries include structured HTML comment metadata for traceability:

```markdown
<!-- specable:story story-001 generated=true actor=actor-coach capability=cap-x expectedResult=er-y -->
As a Coach, I can Schedule Session so that Session Is Scheduled.
```

## `check-result.json` (combined)

```json
{
  "schemaVersion": 1,
  "validation": { "...": "validation.json body" },
  "integrity": { "...": "integrity-report.json body" },
  "summaryPath": "summary.md",
  "passed": false
}
```

## Determinism

- No timestamps in Markdown by default.
- JSON keys sorted lexicographically where feasible.
- Finding ordering: severity desc → type → id → code.

## Story text metadata

Structured outputs (`validation.json`, CLI diagnostic JSON if added later) SHOULD include:

```json
{
  "storyId": "story-001",
  "textSource": "generated",
  "text": "As a ..."
}
```

Human Markdown may omit `generated` label per FR-052.
