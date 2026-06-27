import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer, projectRootSqliteTestLayer } from "../fixtures/project/layers.js"

const assertEmptyGraphContract = (descriptor: {
  readonly graph: {
    readonly countsByType: Record<string, number>
    readonly empty: boolean
    readonly totalPrimitives: number
  }
  readonly primitiveTypes: readonly string[]
  readonly schemaVersion: number
}) => {
  expect(descriptor.schemaVersion).toBe(1)
  expect(descriptor.primitiveTypes).toEqual([...CANONICAL_PRIMITIVE_TYPES])
  expect(descriptor.graph.empty).toBe(true)
  expect(descriptor.graph.totalPrimitives).toBe(0)

  for (const type of CANONICAL_PRIMITIVE_TYPES) {
    expect(descriptor.graph.countsByType[type]).toBe(0)
  }
}

describe("Empty-graph contract", () => {
  it.effect("JSON-backed root reports zero primitives for all nine types", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-empty-json-"))
      const projectRoot = path.join(parentDir, "demo-json")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "json" })
      const descriptor = yield* service.describe(projectRoot)

      assertEmptyGraphContract(descriptor)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("SQLite-backed root reports zero primitives for all nine types", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-empty-sqlite-"))
      const projectRoot = path.join(parentDir, "demo-sqlite")
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "sqlite" })
      const descriptor = yield* service.describe(projectRoot)

      assertEmptyGraphContract(descriptor)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootSqliteTestLayer)))
})
