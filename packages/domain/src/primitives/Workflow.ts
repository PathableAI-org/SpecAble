import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Workflow = Schema.Struct({
  type: Schema.Literal("Workflow").annotations({
    description: "Discriminator value identifying this primitive as Workflow",
    documentation: "Use `Workflow` in the `type` field only for Workflow primitives.",
    examples: ["Workflow"],
    identifier: "WorkflowType",
    title: "Workflow Type"
  }),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(
    ReferenceArray.annotations({
      description: "Capabilities sequenced or coordinated by this workflow",
      documentation:
        "Relationship field: Workflow.capabilities references Capability primitives. Required when the Workflow is Active.",
      identifier: "WorkflowCapabilities",
      title: "Capabilities"
    })
  ),
  domainConcepts: Schema.optional(
    ReferenceArray.annotations({
      description: "Domain concepts materially handled across this workflow",
      documentation: "Relationship field: Workflow.domainConcepts references DomainConcept primitives.",
      identifier: "WorkflowDomainConcepts",
      title: "Domain Concepts"
    })
  ),
  expectedResults: Schema.optional(
    ReferenceArray.annotations({
      description: "Expected results this workflow is intended to produce or support",
      documentation: "Relationship field: Workflow.expectedResults references ExpectedResult primitives.",
      identifier: "WorkflowExpectedResults",
      title: "Expected Results"
    })
  ),
  objectives: Schema.optional(
    ReferenceArray.annotations({
      description: "Objectives this workflow operationalizes",
      documentation:
        "Relationship field: Workflow.objectives references Objective primitives. Required when the Workflow is Active.",
      identifier: "WorkflowObjectives",
      title: "Objectives"
    })
  ),
  primaryActors: Schema.optional(
    ReferenceArray.annotations({
      description: "Actors primarily responsible for or participating in this workflow",
      documentation:
        "Relationship field: Workflow.primaryActors references Actor primitives. Required when the Workflow is Active.",
      identifier: "WorkflowPrimaryActors",
      title: "Primary Actors"
    })
  ),
  sequenceNotes: Schema.optional(
    Schema.String.annotations({
      description: "Step or sequence notes explaining the operational flow",
      documentation: "Use this to describe ordering or handoffs; keep linked capabilities as graph references.",
      examples: ["Coach creates a session, confirms participant details, then checks readiness before the meeting."],
      identifier: "WorkflowSequenceNotes",
      title: "Sequence Notes"
    })
  ),
  stories: Schema.optional(
    ReferenceArray.annotations({
      description: "Stories derived from or demonstrating this workflow",
      documentation: "Relationship field: Workflow.stories references Story primitives.",
      identifier: "WorkflowStories",
      title: "Stories"
    })
  )
}).annotations({
  description: "Operational sequence linking objectives, actors, capabilities, and stories",
  documentation:
    "Workflows show how objectives become coordinated behavior. They should link primary actors, sequenced capabilities, and resulting stories.",
  examples: [
    {
      capabilities: [makePrimitiveId("cap-schedule-session")],
      domainConcepts: [makePrimitiveId("concept-session")],
      expectedResults: [makePrimitiveId("result-less-manual-scheduling")],
      id: makePrimitiveId("workflow-session-scheduling"),
      name: "Session scheduling",
      objectives: [makePrimitiveId("obj-improve-coach-utilization")],
      primaryActors: [{ id: makePrimitiveId("actor-care-coach"), role: "Primary" }],
      sequenceNotes: "Coach creates a session, confirms details, and checks readiness.",
      status: "Active",
      stories: [makePrimitiveId("story-coach-schedules-session")],
      type: "Workflow"
    }
  ],
  identifier: "Workflow",
  title: "Workflow"
})

export type Workflow = typeof Workflow.Type
