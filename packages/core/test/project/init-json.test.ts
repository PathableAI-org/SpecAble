import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { GRAPH_METADATA_FILE } from "../../src/storage/JsonStorageBackend.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { PRIMITIVE_TYPE_FILE_ENTRIES } from "../../src/storage/PrimitiveTypes.js"
import {
  assertAllPrimitiveFilesEmpty,
  isUuidV4,
  makeTempProjectDir,
  readSpecableJson,
  removeTempDir,
  SPECABLE_JSON
} from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer } from "../fixtures/project/layers.js"

describe("ProjectRootService.initialize (JSON)", () => {
  it.effect("creates specable.json, nine empty type files, and graph.json metadata", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-init-json-"))
      const projectRoot = path.join(parentDir, "demo-json")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "json" })

      const config = yield* Effect.promise(() => readSpecableJson(projectRoot))

      expect(config.storage).toEqual({ location: ".", type: "json" })
      expect(config.schemaVersion).toBe(1)
      expect(config.specableVersion).toBe(1)
      expect(config.primitiveTypes).toEqual([...CANONICAL_PRIMITIVE_TYPES])
      expect(config.name).toBe("demo-json")
      expect(isUuidV4(config.projectId)).toBe(true)

      yield* Effect.promise(() => assertAllPrimitiveFilesEmpty(projectRoot))

      for (const { fileName } of PRIMITIVE_TYPE_FILE_ENTRIES) {
        const exists = yield* Effect.promise(() =>
          fs.access(path.join(projectRoot, fileName)).then(() => true).catch(() => false)
        )
        expect(exists).toBe(true)
      }

      const graphMetadataExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, GRAPH_METADATA_FILE)).then(() => true).catch(() => false)
      )
      expect(graphMetadataExists).toBe(true)

      const manifestStat = yield* Effect.promise(() => fs.stat(path.join(projectRoot, SPECABLE_JSON)))
      expect(manifestStat.isFile()).toBe(true)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("uses optional display name override", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-init-json-name-"))
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { name: "Custom Name", storage: "json" })

      const config = yield* Effect.promise(() => readSpecableJson(projectRoot))
      expect(config.name).toBe("Custom Name")

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("falls back to basename when --name is blank", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-init-json-blank-name-"))
      const projectRoot = path.join(parentDir, "demo-json")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { name: "   ", storage: "json" })

      const config = yield* Effect.promise(() => readSpecableJson(projectRoot))
      expect(config.name).toBe("demo-json")

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))
})
