import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import { cleanupProjectRoot, initJsonProjectRoot, sampleCreateInput } from "../fixtures/primitive/helpers.js"
import { primitiveServiceJsonTestLayer } from "../fixtures/project/layers.js"

describe("PrimitiveService.list (JSON)", () => {
  it.effect("lists all primitives in stable type, name, id order", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService

      yield* service.create(sampleCreateInput(projectRoot, "Actor", "Coach"))
      yield* service.create(sampleCreateInput(projectRoot, "Capability", "Schedule session"))

      const summaries = yield* service.list(projectRoot)

      expect(summaries).toHaveLength(2)
      expect(summaries.map((summary) => summary.type)).toEqual(["Actor", "Capability"])
      expect(summaries[0]?.name).toBe("Coach")
      expect(summaries[0]?.status).toBe("Draft")
      expect(summaries[0]?.id).toMatch(/^actor-coach-[0-9a-z]{4}$/)
      expect(summaries[1]?.name).toBe("Schedule session")
      expect(summaries[1]?.id).toMatch(/^cap-schedule-session-[0-9a-z]{4}$/)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))

  it.effect("filters list results by primitive type", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService

      yield* service.create(sampleCreateInput(projectRoot, "Actor", "Coach"))
      yield* service.create(sampleCreateInput(projectRoot, "Capability", "Schedule session"))

      const summaries = yield* service.list(projectRoot, { type: "Capability" })

      expect(summaries).toHaveLength(1)
      expect(summaries[0]?.type).toBe("Capability")
      expect(summaries[0]?.name).toBe("Schedule session")

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))
})
