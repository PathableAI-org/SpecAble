import { Schema } from "@effect/schema"
import { describe, expect, test } from "vitest"

import { makePrimitiveId } from "../src/PrimitiveBase.js"
import { Capability } from "../src/primitives/Capability.js"
import { CapabilityConceptLink } from "../src/primitives/CapabilityConceptLink.js"
import { Primitive } from "../src/primitives/index.js"
import { Story } from "../src/primitives/Story.js"
import { Workflow } from "../src/primitives/Workflow.js"
import { ReferenceArray } from "../src/Reference.js"

describe("schema decode compositions", () => {
  test("ReferenceArray round-trips mixed string and object references", () => {
    const input = [
      "actor-care-coach",
      { id: "actor-client", role: "Supporting" },
      makePrimitiveId("actor-scheduler")
    ]

    const decoded = Schema.decodeUnknownSync(ReferenceArray)(
      Schema.encodeSync(ReferenceArray)(Schema.decodeUnknownSync(ReferenceArray)(input))
    )

    expect(decoded).toHaveLength(3)
    expect(decoded[0]).toBe("actor-care-coach")
    expect(decoded[1]).toEqual({ id: "actor-client", role: "Supporting" })
    expect(decoded[2]).toBe("actor-scheduler")
  })

  test("Story round-trips the actor-capability-expectedResult triple with mixed reference forms", () => {
    const input = {
      actor: "actor-care-coach",
      capability: { id: "cap-schedule-session", role: "Primary" },
      expectedResult: "result-less-manual-scheduling",
      id: "story-coach-schedules-session",
      name: "Coach schedules session",
      status: "Active",
      text: "As a Care coach, I can schedule a coaching session so that session coordination takes less manual work.",
      type: "Story",
      workflows: ["workflow-session-scheduling"]
    }

    const decoded = Schema.decodeUnknownSync(Story)(
      Schema.encodeSync(Story)(Schema.decodeUnknownSync(Story)(input))
    )

    expect(decoded.type).toBe("Story")
    expect(decoded.actor).toBe("actor-care-coach")
    expect(decoded.capability).toEqual({ id: "cap-schedule-session", role: "Primary" })
    expect(decoded.expectedResult).toBe("result-less-manual-scheduling")
    expect(decoded.workflows).toEqual(["workflow-session-scheduling"])
  })

  test("Workflow round-trips primaryActors with role-qualified object references", () => {
    const input = {
      capabilities: ["cap-schedule-session"],
      id: "workflow-session-scheduling",
      name: "Session scheduling",
      objectives: ["obj-improve-coach-utilization"],
      primaryActors: [{ id: "actor-care-coach", role: "Primary" }],
      status: "Active",
      type: "Workflow"
    }

    const decoded = Schema.decodeUnknownSync(Workflow)(
      Schema.encodeSync(Workflow)(Schema.decodeUnknownSync(Workflow)(input))
    )

    expect(decoded.primaryActors).toEqual([{ id: "actor-care-coach", role: "Primary" }])
    expect(decoded.capabilities).toEqual(["cap-schedule-session"])
  })

  test("Capability round-trips optional relationship arrays", () => {
    const input = {
      actors: ["actor-care-coach", { id: "actor-client", role: "Supporting" }],
      domainConcepts: ["concept-session"],
      expectedResults: ["result-less-manual-scheduling"],
      id: "cap-schedule-session",
      name: "Schedule coaching session",
      status: "Active",
      type: "Capability",
      workflows: ["workflow-session-scheduling"]
    }

    const decoded = Schema.decodeUnknownSync(Capability)(
      Schema.encodeSync(Capability)(Schema.decodeUnknownSync(Capability)(input))
    )

    expect(decoded.actors).toEqual([
      "actor-care-coach",
      { id: "actor-client", role: "Supporting" }
    ])
    expect(decoded.domainConcepts).toEqual(["concept-session"])
    expect(decoded.expectedResults).toEqual(["result-less-manual-scheduling"])
    expect(decoded.workflows).toEqual(["workflow-session-scheduling"])
  })

  test("CapabilityConceptLink round-trips capability-domainConcept links with role metadata", () => {
    const input = {
      capability: "cap-schedule-session",
      domainConcept: { id: "concept-session", role: "Primary" },
      id: "link-schedule-session-creates-session",
      importance: "Primary",
      name: "Schedule session creates session",
      role: "Creates",
      status: "Active",
      type: "CapabilityConceptLink"
    }

    const decoded = Schema.decodeUnknownSync(CapabilityConceptLink)(
      Schema.encodeSync(CapabilityConceptLink)(Schema.decodeUnknownSync(CapabilityConceptLink)(input))
    )

    expect(decoded.capability).toBe("cap-schedule-session")
    expect(decoded.domainConcept).toEqual({ id: "concept-session", role: "Primary" })
    expect(decoded.importance).toBe("Primary")
    expect(decoded.role).toBe("Creates")
  })

  test("Primitive union decodes by type discriminator", () => {
    const storyInput = {
      actor: "actor-care-coach",
      capability: "cap-schedule-session",
      expectedResult: "result-less-manual-scheduling",
      id: "story-coach-schedules-session",
      name: "Coach schedules session",
      status: "Active",
      type: "Story"
    }
    const capabilityInput = {
      id: "cap-schedule-session",
      name: "Schedule coaching session",
      status: "Draft",
      type: "Capability"
    }

    const story = Schema.decodeUnknownSync(Primitive)(
      Schema.encodeSync(Primitive)(Schema.decodeUnknownSync(Primitive)(storyInput))
    )
    const capability = Schema.decodeUnknownSync(Primitive)(
      Schema.encodeSync(Primitive)(Schema.decodeUnknownSync(Primitive)(capabilityInput))
    )

    expect(story.type).toBe("Story")
    expect(capability.type).toBe("Capability")
  })
})
