import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { PrimitiveService } from "../../src/primitive/PrimitiveService.js"
import {
  cleanupProjectRoot,
  initJsonProjectRoot,
  sampleActorFields,
  sampleCreateInput
} from "../fixtures/primitive/helpers.js"
import { primitiveServiceJsonTestLayer } from "../fixtures/project/layers.js"

describe("PrimitiveService.create (JSON)", () => {
  it.effect("creates Capability and Actor primitives with optional fields", () =>
    Effect.gen(function*() {
      const { parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const service = yield* PrimitiveService

      const capability = yield* service.create(
        sampleCreateInput(projectRoot, "Capability", "Schedule session", { status: "Draft" })
      )

      expect(capability.type).toBe("Capability")
      expect(capability.name).toBe("Schedule session")
      expect(capability.status).toBe("Draft")
      expect(capability.id).toMatch(/^cap-schedule-session-[0-9a-z]{4}$/)

      const actor = yield* service.create(
        sampleCreateInput(projectRoot, "Actor", "Coach", {
          fields: sampleActorFields,
          status: "Draft"
        })
      )

      expect(actor.type).toBe("Actor")
      expect(actor.name).toBe("Coach")
      expect(actor.id).toMatch(/^actor-coach-[0-9a-z]{4}$/)
      expect(actor).toMatchObject(sampleActorFields)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(primitiveServiceJsonTestLayer)))
})
