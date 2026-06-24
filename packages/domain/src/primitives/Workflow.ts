import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Workflow = Schema.Struct({
  type: primitiveTypeLiteral("Workflow"),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Capabilities sequenced or coordinated by this workflow",
        from: "Workflow",
        identifier: "WorkflowCapabilities",
        requiredWhenActive: true,
        role: "sequences",
        title: "Capabilities",
        to: "Capability"
      })
    )
  ),
  domainConcepts: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Domain concepts materially handled across this workflow",
        from: "Workflow",
        identifier: "WorkflowDomainConcepts",
        role: "touches",
        title: "Domain Concepts",
        to: "DomainConcept"
      })
    )
  ),
  expectedResults: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Expected results this workflow is intended to produce or support",
        from: "Workflow",
        identifier: "WorkflowExpectedResults",
        role: "delivers",
        title: "Expected Results",
        to: "ExpectedResult"
      })
    )
  ),
  objectives: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Objectives this workflow operationalizes",
        from: "Workflow",
        identifier: "WorkflowObjectives",
        requiredWhenActive: true,
        role: "operationalizes",
        title: "Objectives",
        to: "Objective"
      })
    )
  ),
  primaryActors: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Actors primarily responsible for or participating in this workflow",
        from: "Workflow",
        identifier: "WorkflowPrimaryActors",
        requiredWhenActive: true,
        role: "primary-participant",
        title: "Primary Actors",
        to: "Actor"
      })
    )
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
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Stories derived from or demonstrating this workflow",
        from: "Workflow",
        identifier: "WorkflowStories",
        role: "demonstrated-by",
        title: "Stories",
        to: "Story"
      })
    )
  )
}).annotations({
  description: "Operational sequence linking objectives, actors, capabilities, and stories",
  documentation:
    "Workflows show how objectives become coordinated behavior. They should link primary actors, sequenced capabilities, and resulting stories.",
  examples: [
    {
      capabilities: ["cap-schedule-session"],
      domainConcepts: ["concept-session"],
      expectedResults: ["result-less-manual-scheduling"],
      id: "workflow-session-scheduling",
      name: "Session scheduling",
      objectives: ["obj-improve-coach-utilization"],
      primaryActors: [{ id: "actor-care-coach", role: "Primary" }],
      sequenceNotes: "Coach creates a session, confirms details, and checks readiness.",
      status: "Active",
      stories: ["story-coach-schedules-session"],
      type: "Workflow"
    }
  ],
  identifier: "Workflow",
  jsonSchema: graphJsonSchema(graphNode("Workflow")),
  title: "Workflow"
})

export type Workflow = typeof Workflow.Type
