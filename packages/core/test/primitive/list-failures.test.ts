import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as path from "node:path"

import { UnknownPrimitiveTypeError } from "../../src/primitive/errors.js"
import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import { ProjectNotFoundError } from "../../src/project/errors.js"
import { expectFailure } from "../fixtures/expectFailure.js"
import { cleanupProjectRoot, initJsonProjectRoot } from "../fixtures/primitive/helpers.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"
import { primitiveServiceJsonTestLayer } from "../fixtures/project/layers.js"

describe("PrimitiveService.list failures", () => {
  it.effect("returns zero summaries for an empty initialized root", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService

      const summaries = yield* service.list(projectRoot)

      expect(summaries).toEqual([])

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects missing project roots", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-list-missing-"))
      const service = yield* PrimitiveService
      const missingRoot = path.join(parentDir, "does-not-exist")
      const exit = yield* Effect.exit(service.list(missingRoot))

      expectFailure(exit, ProjectNotFoundError)

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects invalid type filters", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService
      const exit = yield* Effect.exit(
        service.list(projectRoot, { type: "NotARealType" as "Capability" })
      )

      expectFailure(exit, UnknownPrimitiveTypeError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))
})
