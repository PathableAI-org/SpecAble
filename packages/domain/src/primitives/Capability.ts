import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Capability = Schema.Struct({
  type: Schema.Literal("Capability").annotations({
    description: "Discriminator value identifying this primitive as Capability",
    documentation: "Use `Capability` in the `type` field only for Capability primitives.",
    examples: ["Capability"],
    identifier: "CapabilityType",
    title: "Capability Type"
  }),
  ...PrimitiveBaseFields,
  actors: Schema.optional(
    ReferenceArray.annotations({
      description: "Actors who perform, depend on, or are materially involved in this capability",
      documentation:
        "Relationship field: Capability.actors references Actor primitives. Required when the Capability is Active.",
      identifier: "CapabilityActors",
      title: "Actors"
    })
  ),
  domainConcepts: Schema.optional(
    ReferenceArray.annotations({
      description: "Domain concepts read, created, changed, or otherwise handled by this capability",
      documentation: "Relationship field: Capability.domainConcepts references DomainConcept primitives.",
      identifier: "CapabilityDomainConcepts",
      title: "Domain Concepts"
    })
  ),
  expectedResults: Schema.optional(
    ReferenceArray.annotations({
      description: "Expected results this capability helps produce",
      documentation:
        "Relationship field: Capability.expectedResults references ExpectedResult primitives. Required when the Capability is Active.",
      identifier: "CapabilityExpectedResults",
      title: "Expected Results"
    })
  ),
  workflows: Schema.optional(
    ReferenceArray.annotations({
      description: "Workflows that use or sequence this capability",
      documentation: "Relationship field: Capability.workflows references Workflow primitives.",
      identifier: "CapabilityWorkflows",
      title: "Workflows"
    })
  )
}).annotations({
  description: "Reusable operational ability linking actors, outcomes, workflows, and concepts",
  documentation:
    "Capabilities describe reusable product abilities. They link who participates, what domain concepts are touched, which workflows use them, and what results they produce.",
  examples: [
    {
      actors: [makePrimitiveId("actor-care-coach")],
      description: "Let coaches create, update, and confirm coaching sessions.",
      domainConcepts: [makePrimitiveId("concept-session")],
      expectedResults: [makePrimitiveId("result-less-manual-scheduling")],
      id: makePrimitiveId("cap-schedule-session"),
      name: "Schedule coaching session",
      status: "Active",
      type: "Capability",
      workflows: [makePrimitiveId("workflow-session-scheduling")]
    }
  ],
  identifier: "Capability",
  title: "Capability"
})

export type Capability = typeof Capability.Type
