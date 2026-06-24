import { Schema } from "@effect/schema"
import { describe, expect, test } from "vitest"

import { PrimitiveId } from "../src/PrimitiveBase.js"
import { Actor } from "../src/primitives/Actor.js"
import { Reference, ReferenceObject } from "../src/Reference.js"

describe("PrimitiveId", () => {
  test("decodes primitive ids from fixture strings as branded ids", () => {
    const id: PrimitiveId = Schema.decodeUnknownSync(PrimitiveId)("actor-care-coach")

    expect(id).toBe("actor-care-coach")
  })

  test("uses the same branded id for primitive identities and reference targets", () => {
    const actor = Schema.decodeUnknownSync(Actor)({
      category: "Human",
      id: "actor-care-coach",
      name: "Care coach",
      status: "Active",
      type: "Actor"
    })
    const referenceObject = Schema.decodeUnknownSync(ReferenceObject)({
      id: "actor-care-coach",
      role: "Primary"
    })
    const shorthandReference = Schema.decodeUnknownSync(Reference)("actor-care-coach")

    const actorId: PrimitiveId = actor.id
    const referenceId: PrimitiveId = referenceObject.id
    if (typeof shorthandReference !== "string") {
      throw new Error("expected shorthand reference to decode to a branded string id")
    }
    const shorthandReferenceId: PrimitiveId = shorthandReference

    expect(actorId).toBe("actor-care-coach")
    expect(referenceId).toBe(actorId)
    expect(shorthandReferenceId).toBe(actorId)
  })
})
