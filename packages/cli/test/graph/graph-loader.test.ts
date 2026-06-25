import { NodeFileSystem } from "@effect/platform-node"
import * as FileSystem from "@effect/platform/FileSystem"
import { assert, describe, expect, it } from "@effect/vitest"
import { FixtureDecodeError } from "@specable/domain/errors.js"
import { Effect } from "effect"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { DuplicateIdError, GraphProjectNotFoundError } from "../../src/errors.js"
import { loadProductGraph } from "../../src/graph/GraphLoader.js"
import { GraphRepository } from "../../src/graph/GraphRepository.js"
import { GraphRepositoryLive } from "../../src/services/Layers.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(testDir, "../fixtures")
const nodeFileSystemLayer = NodeFileSystem.layer

describe("GraphLoader", () => {
  it.effect("treats missing type files as empty collections", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const graph = yield* loadProductGraph(fs, path.join(fixturesDir, "graph-minimal"))

      expect(graph.primitives).toHaveLength(1)
      expect(graph.primitives[0]?.type).toBe("Actor")
      expect(graph.index.byType.get("Objective")).toBeUndefined()
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("fails when the project directory is missing", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const missingPath = path.join(fixturesDir, "does-not-exist")
      const error = yield* loadProductGraph(fs, missingPath).pipe(Effect.flip)

      assert(error._tag === "GraphProjectNotFoundError")
      expect(error.path).toBe(missingPath)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("fails on malformed JSON with FixtureDecodeError", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const error = yield* loadProductGraph(fs, path.join(fixturesDir, "graph-invalid-json")).pipe(Effect.flip)

      expect(error).toBeInstanceOf(FixtureDecodeError)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("fails on schema decode errors with FixtureDecodeError", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const error = yield* loadProductGraph(fs, path.join(fixturesDir, "graph-invalid-schema")).pipe(Effect.flip)

      expect(error).toBeInstanceOf(FixtureDecodeError)
    }).pipe(Effect.provide(nodeFileSystemLayer)))

  it.effect("fails when duplicate primitive ids are indexed", () =>
    Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const error = yield* loadProductGraph(fs, path.join(fixturesDir, "graph-duplicate-id")).pipe(Effect.flip)

      expect(error).toBeInstanceOf(DuplicateIdError)
      if (error._tag === "DuplicateIdError") {
        expect(error.id).toBe("actor-coach")
      }
    }).pipe(Effect.provide(nodeFileSystemLayer)))
})

describe("GraphRepository", () => {
  it.layer(GraphRepositoryLive)((it) => {
    it.effect("loads graphs through the repository abstraction", () =>
      Effect.gen(function*() {
        const repository = yield* GraphRepository
        const graph = yield* repository.load(path.join(fixturesDir, "graph-minimal"))

        expect(graph.projectPath).toContain("graph-minimal")
        expect(graph.primitives).toHaveLength(1)
      }))

    it.effect("surfaces GraphProjectNotFoundError through the repository", () =>
      Effect.gen(function*() {
        const repository = yield* GraphRepository
        const missingPath = path.join(fixturesDir, "does-not-exist")
        const error = yield* repository.load(missingPath).pipe(Effect.flip)

        expect(error).toBeInstanceOf(GraphProjectNotFoundError)
      }))
  })
})
