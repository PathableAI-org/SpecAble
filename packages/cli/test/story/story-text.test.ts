import { describe, expect, it } from "@effect/vitest"
import { PrimitiveBase } from "@specable/domain"

import {
  displayNameFor,
  formatStoryMetadataComment,
  generateStoryText,
  resolveStoryText,
  sanitizeStoryMetadataToken
} from "../../src/story/StoryText.js"
import { ids, makeTestGraph } from "../fixtures/validation/helpers.js"

describe("StoryText", () => {
  const graph = makeTestGraph([
    {
      category: "Human",
      description: "Coach",
      id: ids.actorCoach,
      name: "Coach",
      status: "Active",
      type: "Actor"
    },
    {
      actors: [ids.actorCoach],
      description: "Schedule",
      expectedResults: [ids.resultScheduled],
      id: ids.capSchedule,
      name: "Schedule Session",
      status: "Active",
      type: "Capability",
      workflows: [ids.workflowScheduling]
    },
    {
      capabilities: [ids.capSchedule],
      definition: "Scheduled",
      id: ids.resultScheduled,
      name: "Session Is Scheduled",
      objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
      status: "Active",
      type: "ExpectedResult"
    },
    {
      actor: ids.actorCoach,
      capability: ids.capSchedule,
      expectedResult: ids.resultScheduled,
      id: ids.storyA,
      name: "Coach schedules session",
      status: "Active",
      type: "Story",
      workflows: [ids.workflowScheduling]
    }
  ])

  it("generates deterministic story text from linked display names", () => {
    const story = graph.index.nodes.get(ids.storyA)

    expect(story?.type).toBe("Story")
    if (story?.type !== "Story") {
      return
    }

    expect(generateStoryText(graph, story)).toBe(
      "As a Coach, I can Schedule Session so that Session Is Scheduled."
    )
  })

  it("falls back to primitive IDs when display names are whitespace-only", () => {
    const graphWithIds = makeTestGraph([
      {
        category: "Human",
        description: "Coach",
        id: ids.actorCoach,
        name: "   ",
        status: "Active",
        type: "Actor"
      },
      {
        actors: [ids.actorCoach],
        description: "Schedule",
        expectedResults: [ids.resultScheduled],
        id: ids.capSchedule,
        name: " ",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "\t",
        objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyA,
        name: "Story",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      }
    ])

    const story = graphWithIds.index.nodes.get(ids.storyA)
    if (story?.type !== "Story") {
      return
    }

    expect(generateStoryText(graphWithIds, story)).toBe(
      `As a ${ids.actorCoach}, I can ${ids.capSchedule} so that ${ids.resultScheduled}.`
    )
    expect(displayNameFor(graphWithIds, ids.actorCoach)).toBe(ids.actorCoach)
  })

  it("prefers stored story text over generated text", () => {
    const storedText = "As a Coach, I can Schedule Session so that Session Is Scheduled."
    const graphWithStored = makeTestGraph([
      ...graph.primitives.filter((primitive) => primitive.id !== ids.storyA),
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: ids.storyA,
        name: "Coach schedules session",
        status: "Active",
        text: storedText,
        type: "Story",
        workflows: [ids.workflowScheduling]
      }
    ])

    const story = graphWithStored.index.nodes.get(ids.storyA)
    if (story?.type !== "Story") {
      return
    }

    const resolved = resolveStoryText(graphWithStored, story)

    expect(resolved?.textSource).toBe("stored")
    expect(resolved?.generated).toBe(false)
    expect(resolved?.text).toBe(storedText)
  })

  it("marks generated story text with generated metadata", () => {
    const story = graph.index.nodes.get(ids.storyA)
    if (story?.type !== "Story") {
      return
    }

    const resolved = resolveStoryText(graph, story)

    expect(resolved?.textSource).toBe("generated")
    expect(resolved?.generated).toBe(true)
  })

  it("sanitizes primitive IDs embedded in story metadata comments", () => {
    expect(sanitizeStoryMetadataToken("actor-coach")).toBe("actor-coach")
    expect(sanitizeStoryMetadataToken("evil-->\ninject")).toBe("evil--&gt;inject")
    expect(sanitizeStoryMetadataToken("a<b>&c")).toBe("a&lt;b&gt;&amp;c")

    const comment = formatStoryMetadataComment(PrimitiveBase.makePrimitiveId("story-->x"), {
      actorId: PrimitiveBase.makePrimitiveId("actor\n1"),
      capabilityId: PrimitiveBase.makePrimitiveId("cap<2>"),
      expectedResultId: PrimitiveBase.makePrimitiveId("result&3"),
      generated: true,
      text: "ignored",
      textSource: "generated"
    })

    const closeIndex = comment.lastIndexOf("-->")
    expect(closeIndex).toBe(comment.length - 3)
    expect(comment.indexOf("-->")).toBe(closeIndex)
    expect(comment).not.toContain("\n")
    expect(comment).toContain("story--&gt;x")
    expect(comment).toContain("actor1")
    expect(comment).toContain("cap&lt;2&gt;")
    expect(comment).toContain("result&amp;3")
  })
})
