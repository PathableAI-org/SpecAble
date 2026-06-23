# CLI Command Contract

**Package**: `@specable/cli`  
**Binary**: `specable`  
**Runtime**: Node.js ≥ 20 (template uses Node 24.x in CI)

## Commands

### `specable check <projectDir>`

**Purpose**: Validate graph, report integrity findings, preview summary.

**Arguments**:
| Name | Required | Description |
|------|----------|-------------|
| `projectDir` | yes | Path to graph project directory |

**Options**:
| Flag | Description |
|------|-------------|
| `--validate-only` | Run structural + status-aware validation only |
| `--integrity-only` | Run integrity report only (includes validation prerequisites for broken refs) |
| `--summary-only` | Generate summary preview/output only |
| `--out <dir>` | Write artifact files; see output contract |

**Default behavior** (no scope flags): validation → integrity → short summary preview to stdout.

**Stdout sections** (deterministic order):
1. Header (`SpecAble check` + project path)
2. Validation status summary
3. Validation failures (if any)
4. Validation warnings (if any)
5. Integrity failures (if any)
6. Integrity warnings (if any)
7. Summary preview (Markdown truncated to documented max lines, e.g. 80)

**Exit codes**:
| Code | Meaning |
|------|---------|
| 0 | No Active validation failures |
| 1 | Active validation failures and/or broken references |
| 2 | Usage/runtime error (missing project dir, decode error) |

Warnings alone do not fail exit code unless `--strict` is added in a future version (not v0).

### `specable --help`

Standard `@effect/cli` help for all commands.

## Implementation notes

- Command definitions live in `packages/cli/src/cli/`.
- Domain services invoked via Effect Layers; `bin.ts` is sole runtime entry.
- Filesystem access through `@effect/platform-node` FileSystem service.
- No network services in v0 command path.

## Future commands (out of scope)

- `specable init`
- MCP server subcommand
- Notion sync subcommands
