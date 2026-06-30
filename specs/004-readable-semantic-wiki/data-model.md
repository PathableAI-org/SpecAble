# Data Model: Readable Semantic Wiki

**Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

## Overview

This data model document describes the wiki file structure for both Markdown and Org backends. The underlying domain data model (primitive schemas from `@specable/domain`) is unchanged. Wiki-specific concepts are the **semantic document** (one file = one primitive) and the **wiki file layout** (type directories, file naming, frontmatter/property-drawer encoding).

## Semantic Document Model

A **semantic document** is a single `.md` or `.org` file in a project root that represents exactly one product primitive. It has three parts:

```
┌─ Structured metadata ─────────────────────────────────┐
│  Machine-readable typed fields (frontmatter / drawer)  │
├─ Body prose ───────────────────────────────────────────┤
│  Human-authored explanation, context, rationale         │
└─────────────────────────────────────────────────────────┘
```

### Structured Metadata

Encodes the fields from the primitive's `@specable/domain` schema. The exact fields vary by primitive type, but every document MUST include at minimum:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable primitive identity (adapter-independent) |
| `type` | `string` | Primitive type from ontology (e.g., `Capability`, `Actor`) |
| `name` | `string` | Human-facing display name |
| `status` | `string` | Lifecycle status: `Draft`, `Active`, or `Deprecated` |

Type-specific fields follow the domain schema. For example, a `Capability` includes:

- `actors` — list of Actor IDs
- `expectedResults` — list of ExpectedResult IDs
- `workflows` — list of Workflow IDs
- `domainConcepts` — list of DomainConcept IDs
- `description` — optional text description

### Body Prose

The body is free-form human-authored text stored verbatim. No encoding, decoding, or transformation is applied. The body MUST NOT be the sole carrier of required formal semantics.

### Document Identity

Identity is determined by the `id` field in metadata, not by file name or file path. File names are derived from IDs for discoverability but are not the canonical identity.

## Markdown Encoding

### On-Disk Layout

```
project-root/
├── specable.json
├── capabilities/
│   ├── cap-schedule-session-a1b2.md
│   └── cap-...
├── actors/
│   ├── actor-care-coach-x9k3.md
│   └── actor-client-m7p2.md
├── objectives/
├── personas/
├── domain-concepts/
├── expected-results/
├── workflows/
├── stories/
└── capability-concept-links/    # Read-only type (no create/list)
```

### File Format

```markdown
---
id: cap-schedule-session-a1b2
type: Capability
name: Schedule coaching session
status: Draft
actors:
  - actor-care-coach-x9k3
expectedResults:
  - result-less-manual-scheduling-f4d2
workflows:
  - workflow-session-scheduling-t8b1
domainConcepts:
  - concept-session-l3m0
---

# Schedule coaching session

Let coaches create, update, and confirm coaching sessions.

## Context

Coaches currently schedule sessions through manual email coordination.
This capability automates the scheduling process.
```

**Encoding rules**:
- File starts with `---\n` on line 1
- YAML block follows (key-value pairs, lists, optional `description` field)
- Closing `---\n` separates metadata from body
- Everything after the closing `---` is body prose (preserved verbatim)
- `js-yaml.dump` with appropriate settings (block style for lists, flow for scalars)

**Decoding rules**:
- Read full file as string
- Split on first `---\n...\n---\n` pattern
- Parse YAML block with `js-yaml.load`
- Validate parsed object against the type's domain schema via `decodePrimitiveUnknown`
- Return decoded primitive with body preserved in a `body` field (or separate storage field)

## Org Encoding

### On-Disk Layout

Same per-type directories, `.org` file extension:

```
project-root/
├── specable.json
├── capabilities/
│   ├── cap-schedule-session-a1b2.org
│   └── cap-...
├── actors/
│   ├── actor-care-coach-x9k3.org
│   └── actor-client-m7p2.org
└── ...
```

### File Format

```org
:PROPERTIES:
:id:       cap-schedule-session-a1b2
:type:     Capability
:name:     Schedule coaching session
:status:   Draft
:actors:   actor-care-coach-x9k3
:expectedResults: result-less-manual-scheduling-f4d2
:workflows: workflow-session-scheduling-t8b1
:domainConcepts: concept-session-l3m0
:END:

Schedule coaching session
=========================

Let coaches create, update, and confirm coaching sessions.

Context
-------

Coaches currently schedule sessions through manual email coordination.
This capability automates the scheduling process.
```

**Encoding rules**:

```
:PROPERTIES:
:KEY1: Value1
:KEY2: Value2
:END:

<body>
```

- `:PROPERTIES:` header on its own line
- Zero or more `:KEY: VALUE` lines (one property per line)
- `:END:` terminator on its own line
- Single blank line after `:END:` (optional)
- Body prose follows (preserved verbatim)
- `#+TITLE:` lines in the body are decorative and ignored on decode

**Decoding rules**:
- Read full file as string
- Find first `:PROPERTIES:\n` ... `\n:END:\n` block
- For each line between, split on `: ` (first occurrence) to get key + value
- Handle colons in values (split only on first `: ` after leading `:`)
- Parse list values: space-separated values on one line (matching the contract at `contracts/README.md`)
- Validate parsed object against domain schema via `decodePrimitiveUnknown`
- Body is everything after `:END:\n` (preserved verbatim)

### Property Drawer Parser Detail

The parser extracts flat key-value pairs:

```
Input: ":actors:   actor-care-coach-x9k3"
Key:   "actors"
Value: "actor-care-coach-x9k3"

Input: ":description: This is a description: with colons"
Key:   "description"
Value: "This is a description: with colons"
```

List-typed values (like `actors`, `expectedResults`, etc.) are stored as space-separated values on one line in the property drawer. On decode, they are split back into arrays by whitespace.

## Wiki File Layout Module

The shared `wiki-file-layout.ts` module provides:

### Type-to-Directory Mapping

```typescript
const PRIMITIVE_TYPE_DIRECTORIES: Record<CanonicalPrimitiveType, string> = {
  Actor: "actors",
  Capability: "capabilities",
  CapabilityConceptLink: "capability-concept-links",
  DomainConcept: "domain-concepts",
  ExpectedResult: "expected-results",
  Objective: "objectives",
  Persona: "personas",
  Story: "stories",
  Workflow: "workflows"
}
```

(Matches existing `PRIMITIVE_TYPE_FILES` naming convention but maps to directories instead of filenames.)

### ID-to-Filename Mapping

```typescript
const idToFilename = (id: string, extension: ".md" | ".org"): string =>
  `${id}${extension}`

const filenameToId = (filename: string): string =>
  filename.replace(/\.(md|org)$/, "")
```

### Directory Entries

```typescript
const WIKI_TYPE_DIRECTORY_ENTRIES = CANONICAL_PRIMITIVE_TYPES.map((type) => ({
  directoryName: PRIMITIVE_TYPE_DIRECTORIES[type],
  extension: ".md" | ".org",  // determined by backend
  type
}))

const ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES = WIKI_TYPE_DIRECTORY_ENTRIES.filter(
  ({ type }) => type !== "CapabilityConceptLink"
)
```

### File Name Safety

IDs are already filesystem-safe (alphanumeric + hyphens). The module provides a `sanitizeIdForFile` pass-through that validates and logs a warning if unexpected characters appear (defense in depth).

## Primitive Body Storage

The body prose is stored as a separate field alongside the decoded primitive. The `Primitive` type from `@specable/domain` already has a body-like concept? Need to verify. If not, the wiki backends may store body in a wrapper type or as additional non-schema metadata that round-trips through the backend.

**Design decision**: The body is preserved at the storage layer as opaque text. The `StorageBackend.create` method already accepts a full `Primitive`. The body is part of the serialized representation but not a domain schema field. Backends store it alongside the structured metadata and return it on `get`. The `PrimitiveSummary` returned by `list` excludes the body.