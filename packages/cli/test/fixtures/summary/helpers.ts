import { PrimitiveBase } from "@specable/domain"

import { ids, makeTestGraph } from "../validation/helpers.js"

export const summaryIds = {
  conceptSession: PrimitiveBase.makePrimitiveId("concept-session"),
  linkScheduleSession: PrimitiveBase.makePrimitiveId("ccl-schedule-session"),
  objectiveScheduling: PrimitiveBase.makePrimitiveId("obj-scheduling"),
  personaCoach: PrimitiveBase.makePrimitiveId("persona-coach")
} as const

export const makeSummaryGraph = () =>
  makeTestGraph([
    {
      description: "Reduce manual scheduling work",
      id: summaryIds.objectiveScheduling,
      name: "Improve scheduling",
      status: "Active",
      successCriteria: "Coaches spend less time coordinating sessions",
      type: "Objective",
      workflows: [ids.workflowScheduling]
    },
    {
      category: "Human",
      description: "Human coach participant",
      id: ids.actorCoach,
      name: "Coach",
      status: "Active",
      type: "Actor"
    },
    {
      description: "Coach persona with validated evidence",
      evidence: "Interview notes",
      goalsOrPainPoints: "Schedule sessions quickly with limited admin time",
      id: summaryIds.personaCoach,
      name: "Busy Coach",
      primaryActors: [ids.actorCoach],
      status: "Active",
      type: "Persona"
    },
    {
      definition: "A scheduled coaching session",
      id: summaryIds.conceptSession,
      name: "Session",
      status: "Active",
      type: "DomainConcept"
    },
    {
      actors: [ids.actorCoach],
      description: "Schedule a coaching session",
      domainConcepts: [summaryIds.conceptSession],
      expectedResults: [ids.resultScheduled],
      id: ids.capSchedule,
      name: "Schedule Session",
      status: "Active",
      type: "Capability",
      workflows: [ids.workflowScheduling]
    },
    {
      capability: ids.capSchedule,
      domainConcept: summaryIds.conceptSession,
      id: summaryIds.linkScheduleSession,
      importance: "Primary",
      name: "Schedule session link",
      role: "Creates",
      status: "Active",
      type: "CapabilityConceptLink"
    },
    {
      capabilities: [ids.capSchedule],
      definition: "Session is scheduled in the system",
      id: ids.resultScheduled,
      name: "Session Is Scheduled",
      objectives: [summaryIds.objectiveScheduling],
      status: "Active",
      type: "ExpectedResult"
    },
    {
      capabilities: [ids.capSchedule],
      description: "Coach schedules a session with a participant",
      id: ids.workflowScheduling,
      name: "Session Scheduling",
      objectives: [summaryIds.objectiveScheduling],
      primaryActors: [ids.actorCoach],
      sequenceNotes: "Coach opens scheduler and confirms session",
      status: "Active",
      stories: [ids.storyA],
      type: "Workflow"
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

export const makeSummaryGraphWithStoredStoryText = () => {
  const graph = makeSummaryGraph()

  return makeTestGraph(
    graph.primitives.map((primitive) =>
      primitive.id === ids.storyA && primitive.type === "Story"
        ? {
          ...primitive,
          text: "As a Coach, I can Schedule Session so that Session Is Scheduled."
        }
        : primitive
    ),
    graph.projectPath
  )
}
