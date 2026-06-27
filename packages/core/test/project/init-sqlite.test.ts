import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Layer } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { StorageBackend } from "../../src/storage/StorageBackend.js"
import { isUuidV4, makeTempProjectDir, readSpecableJson, removeTempDir } from "../fixtures/project/helpers.js"
import { projectRootSqliteTestLayer, sqliteStorageTestLayer } from "../fixtures/project/layers.js"

const sqliteInitTestLayer = Layer.merge(projectRootSqliteTestLayer, sqliteStorageTestLayer)

describe("ProjectRootService.initialize (SQLite)", () => {
  it.effect("creates specable.json and an empty graph.sqlite database", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-init-sqlite-"))
      const projectRoot = path.join(parentDir, "demo-sqlite")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "sqlite" })

      const config = yield* Effect.promise(() => readSpecableJson(projectRoot))

      expect(config.storage).toEqual({ location: "graph.sqlite", type: "sqlite" })
      expect(config.name).toBe("demo-sqlite")
      expect(isUuidV4(config.projectId)).toBe(true)

      const dbExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, "graph.sqlite")).then(() => true).catch(() => false)
      )
      expect(dbExists).toBe(true)

      const storage = yield* StorageBackend
      const summary = yield* storage.describe(projectRoot, config)

      expect(summary.empty).toBe(true)
      expect(summary.totalPrimitives).toBe(0)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(sqliteInitTestLayer)))
})
