import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import { PrimitiveNotFoundError } from "../../src/primitive/errors.js"
import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import { ProjectNotFoundError } from "../../src/project/errors.js"
import { expectFailure } from "../fixtures/expectFailure.js"
import {
  cleanupProjectRoot,
  initJsonProjectRoot,
  initSqliteProjectRoot,
  sampleCapabilityFields,
  sampleCreateInput
} from "../fixtures/primitive/helpers.js"
import { primitiveServiceJsonTestLayer, primitiveServiceSqliteTestLayer } from "../fixtures/project/layers.js"

const semanticPrimitive = (primitive: {
  readonly id: string
  readonly name: string
  readonly [key: string]: unknown
  readonly status: string
  readonly type: string
}) => {
  const fields = Object.fromEntries(
    Object.entries(primitive).filter(([key]) => !["id", "name", "status", "type"].includes(key))
  )

  return {
    fields,
    name: primitive.name,
    status: primitive.status,
    type: primitive.type
  }
}

describe("PrimitiveService.get parity", () => {
  it.effect("JSON and SQLite roots return semantically equivalent primitives", () =>
    Effect.gen(function*() {
      const jsonFixture = yield* Effect.promise(() => initJsonProjectRoot("demo-json"))
      const sqliteFixture = yield* Effect.promise(() => initSqliteProjectRoot("demo-sqlite"))

      const jsonService = yield* PrimitiveService.pipe(Effect.provide(primitiveServiceJsonTestLayer))
      const sqliteService = yield* PrimitiveService.pipe(Effect.provide(primitiveServiceSqliteTestLayer))

      const createInput = sampleCreateInput(jsonFixture.projectRoot, "Capability", "Schedule session", {
        fields: sampleCapabilityFields,
        status: "Draft"
      })

      const jsonCreated = yield* jsonService.create(createInput)
      const sqliteCreated = yield* sqliteService.create({
        ...createInput,
        rootPath: sqliteFixture.projectRoot
      })

      const jsonLoaded = yield* jsonService.get(jsonFixture.projectRoot, jsonCreated.id)
      const sqliteLoaded = yield* sqliteService.get(sqliteFixture.projectRoot, sqliteCreated.id)

      expect(semanticPrimitive(jsonLoaded)).toEqual(semanticPrimitive(sqliteLoaded))
      expect(jsonCreated.id).not.toBe(sqliteCreated.id)

      yield* Effect.promise(() => cleanupProjectRoot(jsonFixture.parentDir))
      yield* Effect.promise(() => cleanupProjectRoot(sqliteFixture.parentDir))
    }))

  it.effect("returns PrimitiveNotFoundError for missing IDs", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService
      const exit = yield* Effect.exit(service.get(projectRoot, "cap-missing-id-z9z9"))

      expectFailure(exit, PrimitiveNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects get against a missing project root", () =>
    Effect.gen(function*() {
      const { makeTempProjectDir, removeTempDir } = yield* Effect.promise(() =>
        import("../fixtures/project/helpers.js")
      )
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-get-missing-"))
      const service = yield* PrimitiveService
      const missingRoot = path.join(parentDir, "does-not-exist")
      const exit = yield* Effect.exit(service.get(missingRoot, "cap-missing-id-z9z9"))

      expectFailure(exit, ProjectNotFoundError)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))
})
