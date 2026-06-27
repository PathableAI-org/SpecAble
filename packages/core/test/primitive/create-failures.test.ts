import { describe, expect, it, vi } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import * as path from "node:path"

import * as assignPrimitiveIdModule from "../../src/primitive/assignPrimitiveId.js"
import {
  DuplicatePrimitiveIdError,
  PrimitiveValidationError,
  UnknownPrimitiveTypeError
} from "../../src/primitive/errors.js"
import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import { ProjectNotFoundError } from "../../src/project/errors.js"
import { cleanupProjectRoot, initJsonProjectRoot, sampleCreateInput } from "../fixtures/primitive/helpers.js"
import { primitiveServiceJsonTestLayer } from "../fixtures/project/layers.js"

const expectFailure = <E>(exit: Exit.Exit<unknown, E>, errorType: new(...args: never[]) => E) => {
  expect(Exit.isFailure(exit)).toBe(true)

  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause)
    expect(Option.isSome(error)).toBe(true)

    if (Option.isSome(error)) {
      expect(error.value).toBeInstanceOf(errorType)
    }
  }
}

describe("PrimitiveService.create failures", () => {
  it.effect("rejects unknown primitive types", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService
      const exit = yield* Effect.exit(
        service.create({
          ...sampleCreateInput(projectRoot, "Capability", "Schedule session"),
          type: "NotARealType" as "Capability"
        })
      )

      expectFailure(exit, UnknownPrimitiveTypeError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects invalid field values with field paths", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService
      const exit = yield* Effect.exit(
        service.create(
          sampleCreateInput(projectRoot, "Actor", "Coach", {
            fields: { category: "NotARealCategory" }
          })
        )
      )

      expectFailure(exit, PrimitiveValidationError)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)

        if (Option.isSome(error) && error.value instanceof PrimitiveValidationError) {
          expect(error.value.fieldPaths?.length).toBeGreaterThan(0)
        }
      }

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects missing project roots", () =>
    Effect.gen(function*() {
      const service = yield* PrimitiveService
      const missingRoot = path.join("/tmp", `specable-missing-root-${Date.now()}`)
      const exit = yield* Effect.exit(
        service.create(sampleCreateInput(missingRoot, "Capability", "Schedule session"))
      )

      expectFailure(exit, ProjectNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(path.dirname(missingRoot)).catch(() => undefined))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("rejects duplicate primitive IDs", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService
      const duplicateId = "cap-duplicate-test-x1y2"

      vi.spyOn(assignPrimitiveIdModule, "assignPrimitiveId").mockReturnValue(duplicateId)

      yield* service.create(sampleCreateInput(projectRoot, "Capability", "Existing capability"))

      const exit = yield* Effect.exit(
        service.create(sampleCreateInput(projectRoot, "Capability", "Schedule session"))
      )

      expectFailure(exit, DuplicatePrimitiveIdError)

      vi.restoreAllMocks()
      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))
})
