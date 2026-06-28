import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import {
  cleanupProjectRoot,
  initSqliteProjectRoot,
  sampleActorFields,
  sampleCapabilityFields,
  sampleCreateInput
} from "../fixtures/primitive/helpers.js"
import { primitiveServiceSqliteTestLayer } from "../fixtures/project/layers.js"

describe("PrimitiveService.get (SQLite)", () => {
  it.effect("returns a full primitive round-trip after create", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initSqliteProjectRoot())
      const service = yield* PrimitiveService

      const capability = yield* service.create(
        sampleCreateInput(projectRoot, "Capability", "Schedule session", {
          fields: sampleCapabilityFields
        })
      )

      const loaded = yield* service.get(projectRoot, capability.id)

      expect(loaded).toEqual(capability)

      const actor = yield* service.create(
        sampleCreateInput(projectRoot, "Actor", "Coach", {
          fields: sampleActorFields
        })
      )

      const loadedActor = yield* service.get(projectRoot, actor.id)

      expect(loadedActor).toEqual(actor)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceSqliteTestLayer)))
})
