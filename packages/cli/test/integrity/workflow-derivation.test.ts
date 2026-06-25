import { describe, expect, it } from "@effect/vitest"
import { PrimitiveBase } from "@specable/domain"

import { findWorkflowDerivationWarnings } from "../../src/integrity/WorkflowDerivation.js"
import { ids, makeTestGraph } from "../fixtures/validation/helpers.js"

describe("WorkflowDerivation", () => {
  it("warns when Active workflow lacks explicit and derivable Expected Results", () => {
    const objectiveId = PrimitiveBase.makePrimitiveId("obj-1")
    const storyId = PrimitiveBase.makePrimitiveId("story-1")

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
        description: "Capability without expected results",
        id: ids.capSchedule,
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        id: ids.workflowScheduling,
        name: "Scheduling workflow",
        objectives: [objectiveId],
        primaryActors: [ids.actorCoach],
        sequenceNotes: "Coach schedules",
        status: "Active",
        stories: [storyId],
        type: "Workflow"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: storyId,
        name: "Story",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "Scheduled",
        objectives: [objectiveId],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        description: "Objective",
        id: objectiveId,
        name: "Objective",
        status: "Active",
        type: "Objective",
        workflows: [ids.workflowScheduling]
      }
    ])

    const warnings = findWorkflowDerivationWarnings(graph)
    const expectedResultWarnings = warnings.filter((finding) => finding.field === "expectedResults")

    expect(expectedResultWarnings.length).toBeGreaterThan(0)
    expect(expectedResultWarnings.every((finding) => finding.code === "missing-workflow-derivation")).toBe(
      true
    )
  })

  it("passes derivability when capability links supply Expected Results", () => {
    const objectiveId = PrimitiveBase.makePrimitiveId("obj-1")
    const storyId = PrimitiveBase.makePrimitiveId("story-1")

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
        description: "Capability with expected results",
        expectedResults: [ids.resultScheduled],
        id: ids.capSchedule,
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        id: ids.workflowScheduling,
        name: "Scheduling workflow",
        objectives: [objectiveId],
        primaryActors: [ids.actorCoach],
        sequenceNotes: "Coach schedules",
        status: "Active",
        stories: [storyId],
        type: "Workflow"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: storyId,
        name: "Story",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "Scheduled",
        objectives: [objectiveId],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        description: "Objective",
        id: objectiveId,
        name: "Objective",
        status: "Active",
        type: "Objective",
        workflows: [ids.workflowScheduling]
      }
    ])

    const warnings = findWorkflowDerivationWarnings(graph)

    expect(warnings.some((finding) => finding.field === "expectedResults")).toBe(false)
  })

  it("derives Domain Concepts from capability concept links", () => {
    const objectiveId = PrimitiveBase.makePrimitiveId("obj-1")
    const storyId = PrimitiveBase.makePrimitiveId("story-1")
    const conceptId = PrimitiveBase.makePrimitiveId("concept-session")
    const linkId = PrimitiveBase.makePrimitiveId("ccl-1")

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
        description: "Capability linked via CCL",
        expectedResults: [ids.resultScheduled],
        id: ids.capSchedule,
        name: "Schedule",
        status: "Active",
        type: "Capability",
        workflows: [ids.workflowScheduling]
      },
      {
        capability: ids.capSchedule,
        domainConcept: conceptId,
        id: linkId,
        importance: "Primary",
        name: "Schedule reads session",
        role: "Reads",
        status: "Active",
        type: "CapabilityConceptLink"
      },
      {
        definition: "Session concept",
        id: conceptId,
        name: "Session",
        status: "Active",
        type: "DomainConcept"
      },
      {
        capabilities: [ids.capSchedule],
        id: ids.workflowScheduling,
        name: "Scheduling workflow",
        objectives: [objectiveId],
        primaryActors: [ids.actorCoach],
        sequenceNotes: "Coach schedules",
        status: "Active",
        stories: [storyId],
        type: "Workflow"
      },
      {
        actor: ids.actorCoach,
        capability: ids.capSchedule,
        expectedResult: ids.resultScheduled,
        id: storyId,
        name: "Story",
        status: "Active",
        type: "Story",
        workflows: [ids.workflowScheduling]
      },
      {
        capabilities: [ids.capSchedule],
        definition: "Scheduled",
        id: ids.resultScheduled,
        name: "Scheduled",
        objectives: [objectiveId],
        status: "Active",
        type: "ExpectedResult"
      },
      {
        description: "Objective",
        id: objectiveId,
        name: "Objective",
        status: "Active",
        type: "Objective",
        workflows: [ids.workflowScheduling]
      }
    ])

    const warnings = findWorkflowDerivationWarnings(graph)

    expect(warnings.some((finding) => finding.field === "domainConcepts")).toBe(false)
    expect(warnings.some((finding) => finding.field === "expectedResults")).toBe(false)
  })
})
