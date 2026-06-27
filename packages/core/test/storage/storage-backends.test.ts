import { NodeFileSystem } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import type { ProjectConfig } from "../../src/project/ProjectConfig.js"

import { JsonStorageBackendLive } from "../../src/storage/JsonStorageBackend.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { SqliteStorageBackendLive } from "../../src/storage/SqliteStorageBackend.js"
import { StorageBackend } from "../../src/storage/StorageBackend.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"

const nodeFileSystemLayer = NodeFileSystem.layer

const sampleJsonConfig = (): ProjectConfig => ({
  createdAt: "2026-06-26T12:00:00.000Z",
  name: "demo-json",
  primitiveTypes: [...CANONICAL_PRIMITIVE_TYPES],
  projectId: "8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
  schemaVersion: 1,
  specableVersion: 1,
  storage: { location: ".", type: "json" }
})

const sampleSqliteConfig = (): ProjectConfig => ({
  ...sampleJsonConfig(),
  name: "demo-sqlite",
  storage: { location: "graph.sqlite", type: "sqlite" }
})

describe("Storage backends", () => {
  it.effect("JSON backend bootstraps and describes an empty graph", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-json-"))
      const config = sampleJsonConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)
      const summary = yield* storage.describe(projectRoot, config)

      expect(summary.empty).toBe(true)
      expect(summary.totalPrimitives).toBe(0)
      expect(summary.countsByType.Actor).toBe(0)

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(JsonStorageBackendLive), Effect.provide(nodeFileSystemLayer)))

  it.effect("SQLite backend bootstraps and describes an empty graph", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-sqlite-"))
      const config = sampleSqliteConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)
      const summary = yield* storage.describe(projectRoot, config)

      expect(summary.empty).toBe(true)
      expect(summary.totalPrimitives).toBe(0)
      expect(path.basename(config.storage.location)).toBe("graph.sqlite")

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(SqliteStorageBackendLive), Effect.provide(nodeFileSystemLayer)))
})
