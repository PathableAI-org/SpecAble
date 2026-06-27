import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { GRAPH_METADATA_FILE } from "../../src/storage/JsonStorageBackend.js"
import { PRIMITIVE_TYPE_FILE_ENTRIES } from "../../src/storage/PrimitiveTypes.js"
import {
  assertAllPrimitiveFilesEmpty,
  assertNoJsonPrimitiveFiles,
  assertSqliteGraphLayout,
  makeTempProjectDir,
  removeTempDir,
  SPECABLE_JSON
} from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer, projectRootSqliteTestLayer } from "../fixtures/project/layers.js"

describe("On-disk layout contract", () => {
  it.effect("JSON backend creates documented file layout after init", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-layout-json-"))
      const projectRoot = path.join(parentDir, "demo-json")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "json" })

      const manifestExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, SPECABLE_JSON)).then(() => true).catch(() => false)
      )
      expect(manifestExists).toBe(true)

      for (const { fileName } of PRIMITIVE_TYPE_FILE_ENTRIES) {
        const exists = yield* Effect.promise(() =>
          fs.access(path.join(projectRoot, fileName)).then(() => true).catch(() => false)
        )
        expect(exists).toBe(true)
      }

      yield* Effect.promise(() => assertAllPrimitiveFilesEmpty(projectRoot))

      const graphMetadataExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, GRAPH_METADATA_FILE)).then(() => true).catch(() => false)
      )
      expect(graphMetadataExists).toBe(true)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("SQLite backend creates documented database layout after init", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-layout-sqlite-"))
      const projectRoot = path.join(parentDir, "demo-sqlite")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "sqlite" })

      const manifestExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, SPECABLE_JSON)).then(() => true).catch(() => false)
      )
      expect(manifestExists).toBe(true)

      const dbPath = path.join(projectRoot, "graph.sqlite")
      const dbExists = yield* Effect.promise(() => fs.access(dbPath).then(() => true).catch(() => false))
      expect(dbExists).toBe(true)

      yield* assertSqliteGraphLayout(dbPath)
      yield* Effect.promise(() => assertNoJsonPrimitiveFiles(projectRoot))

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootSqliteTestLayer)))
})
