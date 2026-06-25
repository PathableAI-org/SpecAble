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

## Artifact split (Session 2026-06-25)

| Concern | `validation.json` | `integrity-report.json` |
|---------|-------------------|-------------------------|
| Active under-linked failures | yes | **no** (do not duplicate) |
| Broken references | yes | no |
| Duplicate IDs | yes | no |
| Duplicate Active story triple failures | yes (`duplicate-story-triple`) | summary only (`duplicateStoryTriples`) |
| Draft incompleteness | yes (warnings) | no |
| Per-primitive advisories (FR-013–FR-026) | yes (warnings) | no |
| Orphans, duplicate names, likely duplicates, workflow derivability | no | yes (warnings) |

`summary.md` **Known Modeling Gaps** may reference both artifacts without duplicating full finding objects.

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

Finding codes (non-exhaustive): `missing-field`, `missing-relationship`, `broken-reference`, `duplicate-id`, `duplicate-story-triple`, `invalid-literal`, `fixture-decode`.

Per-primitive advisory codes (warnings): `capability-too-broad`, `disconnected-actor`, `implementation-shaped-domain-concept`, `vague-expected-result`, `persona-lacks-evidence`, etc.

## `integrity-report.json`

Integrity-specific findings only. Active validation failures MUST NOT be duplicated here.

```json
{
  "schemaVersion": 1,
  "projectDir": "/path/to/graph",
  "warningCount": 2,
  "findings": [
    {
      "severity": "warning",
      "code": "duplicate-name",
      "primitiveType": "Capability",
      "primitiveId": "cap-a",
      "relatedIds": ["cap-b"],
      "message": "Duplicate normalized name \"schedule session\" within Capability"
    }
  ],
  "duplicateStoryTriples": [
    {
      "actorId": "actor-a",
      "capabilityId": "cap-b",
      "expectedResultId": "er-c",
      "storyIds": ["story-1", "story-2"]
    }
  ]
}
```

Integrity finding codes (warnings unless noted):

| Code | Description |
|------|-------------|
| `duplicate-name` | Exact normalized name match within type (trim + lowercase) |
| `likely-duplicate-name` | Jaccard ≥ 0.8 on word tokens after normalization |
| `orphan` | Zero-edge primitive whose type cannot stand alone; excludes disconnected Actors and standalone Draft Objectives |
| `missing-workflow-derivation` | Active Workflow lacks explicit or capability-derived Expected Results / Domain Concepts |

`duplicateStoryTriples` is a **summary section** for fix-up context. Exit code `1` for duplicate triples comes from validation `duplicate-story-triple` failures.

## Name normalization

Duplicate and likely-duplicate detection:

1. `trim()` display name
2. `toLowerCase()` full string
3. Preserve internal spacing and punctuation
4. Likely duplicates: tokenize on whitespace → Jaccard ≥ 0.8

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

Gap section subdivides **Failures** (from validation) vs **Warnings** (validation advisories + integrity-specific warnings).

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

Human Markdown may omit `generated` label per FR-052. Template placeholders use linked primitive display names when non-empty; otherwise fall back to primitive IDs (FR-010b).
