import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Capability = Schema.Struct({
  type: primitiveTypeLiteral("Capability"),
  ...PrimitiveBaseFields,
  actors: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Actors who perform, depend on, or are materially involved in this capability",
        from: "Capability",
        identifier: "CapabilityActors",
        requiredWhenActive: true,
        role: "participant",
        title: "Actors",
        to: "Actor"
      })
    )
  ),
  domainConcepts: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Domain concepts read, created, changed, or otherwise handled by this capability",
        from: "Capability",
        identifier: "CapabilityDomainConcepts",
        role: "operates-on",
        title: "Domain Concepts",
        to: "DomainConcept"
      })
    )
  ),
  expectedResults: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Expected results this capability helps produce",
        from: "Capability",
        identifier: "CapabilityExpectedResults",
        requiredWhenActive: true,
        role: "produces",
        title: "Expected Results",
        to: "ExpectedResult"
      })
    )
  ),
  workflows: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Workflows that use or sequence this capability",
        from: "Capability",
        identifier: "CapabilityWorkflows",
        role: "used-in",
        title: "Workflows",
        to: "Workflow"
      })
    )
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
  jsonSchema: graphJsonSchema(graphNode("Capability")),
  title: "Capability"
})

export type Capability = typeof Capability.Type
