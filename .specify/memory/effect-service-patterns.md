# Effect Service Patterns (SpecAble)

Canonical reference for Effect `Requirements` (`R`), service tags, Layers, and
platform I/O in SpecAble. Read this during `/speckit-plan`, `/speckit-tasks`, and
`/speckit-implement` when a feature touches services or I/O.

**Effect docs**: [FileSystem](https://effect.website/docs/platform/file-system/#basic-usage),
[Managing Services](https://effect.website/docs/requirements-management/services/)

## Effect type: `Effect<A, E, R>`

| Parameter | Meaning |
|-----------|---------|
| `A` | Success value |
| `E` | Expected failure (tagged errors) |
| `R` | **Requirements** — services/tags the effect needs from `Context` |

When `R` is `never`, the effect needs no external services. When `R` includes
`FileSystem.FileSystem`, callers must `Effect.provide` a FileSystem Layer before
running.

Access services with `yield* Tag` inside `Effect.gen` — never pass service instances
as function parameters.

## Package boundaries

| Package | Requirements rule |
|---------|-------------------|
| `@specable/domain` | Schema-only; `Effect<_, _, never>`; no `@effect/platform` imports |
| `@specable/core`, `@specable/cli` libraries | Consumer-facing service methods return `Effect<_, DomainError, never>` when Layer construction absorbed platform deps; OR propagate `R` honestly if not absorbed |
| `@effect/platform` | Used in library src for tags (`FileSystem`); no `@effect/platform-node` in library src |
| `@effect/platform-node` | Composed only at entrypoints (`bin.ts`) and in test harnesses |
| Tests | `Effect.provide(TestLayer)`; prefer `@effect/vitest` `it.effect` |

## FileSystem pattern

Programs declare `FileSystem.FileSystem` in `R`, access via `yield*`, and receive
the Live implementation at the edge:

```typescript
import * as FileSystem from "@effect/platform/FileSystem"
import { Effect } from "effect"

// Effect<void, PlatformError, FileSystem.FileSystem>
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.readFileString("./specable.json", "utf8")
})
```

At the CLI entrypoint or in tests:

```typescript
import { NodeFileSystem } from "@effect/platform-node"
import { Effect } from "effect"

program.pipe(Effect.provide(NodeFileSystem.layer))
```

For unit tests without disk I/O, use `FileSystem.layerNoop` or a custom test Layer.

## Service + Layer pattern (Layer absorbs deps)

Resolve platform tags during **Layer construction**, not in CLI commands.
Returned service methods should have `R = never` when deps are captured at build time.

Reference: `packages/cli/src/graph/GraphLoader.ts`

```typescript
import * as FileSystem from "@effect/platform/FileSystem"
import { Effect } from "effect"

export class GraphLoader extends Effect.Service<GraphLoader>()("@specable/cli/GraphLoader", {
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return {
      // load returns Effect<_, _, never> — fs captured at Layer build
      load: (projectPath: string) => loadProductGraph(fs, projectPath)
    }
  })
})
```

Compose Live Layers at one composition root per app:

- `packages/cli/src/services/Layers.ts` — merges feature Layers + platform
- `packages/cli/src/bin.ts` — `Effect.provide(MainLayer)` + `NodeRuntime.runMain`

Export per-backend Live modules from the owning feature (e.g.
`packages/core/src/storage/layers.ts`). Do **not** export a pre-composed god Layer
from library packages.

## Context.Tag alternative

For pluggable backends (multiple Live implementations of one contract), use
`Context.Tag` + `Layer.effect`:

```typescript
export class StorageBackend extends Context.Tag("@specable/core/StorageBackend")<
  StorageBackend,
  StorageBackendService
>() {}

export const JsonStorageBackendLive = Layer.effect(StorageBackend, makeJsonStorageBackend)
```

Entrypoints choose which Live Layer to provide at compose time.

## Test pattern

```typescript
import { NodeFileSystem } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

const nodeFileSystemLayer = NodeFileSystem.layer

describe("MyService", () => {
  it.effect("loads data", () =>
    myProgram.pipe(
      Effect.provide(MyServiceLive),
      Effect.provide(nodeFileSystemLayer)
    ))
})
```

## Local reference implementations

| Pattern | File |
|---------|------|
| Effect.Service + absorbed FileSystem | `packages/cli/src/graph/GraphLoader.ts` |
| Repository over loader | `packages/cli/src/graph/GraphRepository.ts` |
| Layer composition root | `packages/cli/src/services/Layers.ts` |
| Entrypoint provide + run | `packages/cli/src/bin.ts` |
| Context.Tag + per-backend Live | `packages/core/src/storage/StorageBackend.ts`, `layers.ts` |

## Anti-patterns

| Anti-pattern | Why wrong | Fix |
|--------------|-----------|-----|
| Import `@effect/platform-node` in library `src/` | Ties library to Node; breaks import safety | Use `@effect/platform` tags; provide Node layer at edge |
| Pass `fs: FileSystem` as a function parameter | Bypasses typed Requirements | `yield* FileSystem.FileSystem` or capture at Layer build |
| Contract says `R = FileSystem` but implementation closes over `fs` at Layer build | Lies to callers about Requirements | Set public method `R` to `never` when Layer absorbed |
| Contract says `R = never` but method `yield*` platform tags | Hidden Requirements leak at runtime | Propagate honest `R` or absorb at Layer build |
| Compose platform Layers inside CLI command modules | Scatters wiring; untestable commands | Compose in `services/Layers.ts` + `bin.ts` only |
| Run effects without `Effect.provide` in tests | Floating Requirements | Always provide test/live Layers in `it.effect` |

## Plan checklist (Service & Layer map)

Every feature plan touching I/O MUST document:

1. **Tags introduced** — service identifiers and public contracts
2. **Live Layer paths** — where `*Live` modules are exported
3. **Composition root** — `bin.ts`, MCP entry, or test harness
4. **Requirements per public method** — which tags appear in `R` vs absorbed at Layer build
