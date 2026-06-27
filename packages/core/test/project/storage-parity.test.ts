import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import type { ProjectDescriptor } from "../../src/project/ProjectDescriptor.js"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer, projectRootSqliteTestLayer } from "../fixtures/project/layers.js"

const semanticDescriptor = (descriptor: ProjectDescriptor) => ({
  graph: descriptor.graph,
  primitiveTypes: descriptor.primitiveTypes,
  schemaVersion: descriptor.schemaVersion
})

describe("Storage backend parity (ProjectDescriptor)", () => {
  it.effect("JSON and SQLite roots expose identical semantic empty-graph contract", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-parity-"))
      const jsonRoot = path.join(parentDir, "demo-json")
      const sqliteRoot = path.join(parentDir, "demo-sqlite")

      const jsonService = yield* ProjectRootService.pipe(Effect.provide(projectRootJsonTestLayer))
      const sqliteService = yield* ProjectRootService.pipe(Effect.provide(projectRootSqliteTestLayer))

      yield* jsonService.initialize(jsonRoot, { storage: "json" })
      yield* sqliteService.initialize(sqliteRoot, { storage: "sqlite" })

      const jsonDescriptor = yield* jsonService.describe(jsonRoot)
      const sqliteDescriptor = yield* sqliteService.describe(sqliteRoot)

      expect(semanticDescriptor(jsonDescriptor)).toEqual(semanticDescriptor(sqliteDescriptor))

      expect(jsonDescriptor.storage).toEqual({ location: ".", type: "json" })
      expect(sqliteDescriptor.storage).toEqual({ location: "graph.sqlite", type: "sqlite" })
      expect(jsonDescriptor.projectId).not.toBe(sqliteDescriptor.projectId)
      expect(jsonDescriptor.rootPath).toBe(path.resolve(jsonRoot))
      expect(sqliteDescriptor.rootPath).toBe(path.resolve(sqliteRoot))

      yield* Effect.promise(() => removeTempDir(parentDir))
    }))
})
