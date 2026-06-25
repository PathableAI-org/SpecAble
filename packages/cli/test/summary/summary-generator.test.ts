import { describe, expect, it } from "@effect/vitest"
import { PrimitiveBase } from "@specable/domain"

import { analyzeProductGraphIntegrity } from "../../src/integrity/IntegrityService.js"
import { generateSummaryMarkdown } from "../../src/summary/SummaryGenerator.js"
import { summarySectionTitles } from "../../src/summary/SummarySections.js"
import { validateProductGraph } from "../../src/validation/ValidationService.js"
import { makeSummaryGraph, makeSummaryGraphWithStoredStoryText } from "../fixtures/summary/helpers.js"
import { ids, makeTestGraph } from "../fixtures/validation/helpers.js"

describe("SummaryGenerator", () => {
  it("includes all contract sections in deterministic order", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const markdown = generateSummaryMarkdown(graph, validation, integrity)

    expect(markdown.startsWith("# Product Primitive Summary")).toBe(true)

    for (const title of summarySectionTitles()) {
      if (title === "Active Objectives") {
        expect(markdown).toContain(`## ${title}`)
      } else {
        expect(markdown).toContain(`## ${title}`)
      }
    }
  })

  it("produces byte-identical output for unchanged graph input", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)

    const first = generateSummaryMarkdown(graph, validation, integrity)
    const second = generateSummaryMarkdown(graph, validation, integrity)

    expect(first).toBe(second)
  })

  it("includes generated story metadata in the Stories section", () => {
    const graph = makeSummaryGraph()
    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const markdown = generateSummaryMarkdown(graph, validation, integrity)

    expect(markdown).toContain(
      `<!-- specable:story ${ids.storyA} generated=true actor=${ids.actorCoach} capability=${ids.capSchedule} expectedResult=${ids.resultScheduled} -->`
    )
    expect(markdown).toContain(
      "As a Coach, I can Schedule Session so that Session Is Scheduled."
    )
  })

  it("uses stored story text when present", () => {
    const graph = makeSummaryGraphWithStoredStoryText()
    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const markdown = generateSummaryMarkdown(graph, validation, integrity)

    expect(markdown).toContain(`generated=false`)
    expect(markdown).toContain(
      "As a Coach, I can Schedule Session so that Session Is Scheduled."
    )
  })

  it("separates validation failures from warnings in Known Modeling Gaps", () => {
    const storyId = PrimitiveBase.makePrimitiveId("story-incomplete")

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
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "Scheduled",
        objectives: [PrimitiveBase.makePrimitiveId("obj-1")],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: storyId,
        name: "Incomplete story",
        status: "Active",
        type: "Story"
      },
      {
        description: "Draft objective",
        id: ids.objDraft,
        name: "Draft objective",
        status: "Draft",
        type: "Objective"
      }
    ])

    const validation = validateProductGraph(graph)
    const integrity = analyzeProductGraphIntegrity(graph, validation)
    const markdown = generateSummaryMarkdown(graph, validation, integrity)

    expect(markdown).toContain("### Failures")
    expect(markdown).toContain("### Warnings")
    expect(markdown).toContain(storyId)
    expect(markdown).toContain(ids.objDraft)
  })
})
