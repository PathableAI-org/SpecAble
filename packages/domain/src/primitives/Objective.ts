import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Objective = Schema.Struct({
  type: Schema.Literal("Objective").annotations({
    description: "Discriminator value identifying this primitive as Objective",
    documentation: "Use `Objective` in the `type` field only for Objective primitives.",
    examples: ["Objective"],
    identifier: "ObjectiveType",
    title: "Objective Type"
  }),
  ...PrimitiveBaseFields,
  expectedResults: Schema.optional(
    ReferenceArray.annotations({
      description: "Expected results that make this objective observable or measurable",
      documentation:
        "Relationship field: Objective.expectedResults references ExpectedResult primitives. Required when the Objective is Active.",
      identifier: "ObjectiveExpectedResults",
      title: "Expected Results"
    })
  ),
  successCriteria: Schema.optional(
    Schema.String.annotations({
      description: "Outcome framing or success criteria for the objective",
      documentation: "Describe how humans will recognize that the objective has been achieved.",
      examples: ["Coaches spend less time coordinating sessions and more time preparing for participants."],
      identifier: "ObjectiveSuccessCriteria",
      title: "Success Criteria"
    })
  ),
  workflows: Schema.optional(
    ReferenceArray.annotations({
      description: "Workflows that operationalize this objective",
      documentation: "Relationship field: Objective.workflows references Workflow primitives.",
      identifier: "ObjectiveWorkflows",
      title: "Workflows"
    })
  )
}).annotations({
  description: "Why work matters; links to workflows and expected results",
  documentation:
    "Objectives capture durable product intent. They should link to expected results and the workflows that realize them.",
  examples: [
    {
      description: "Improve how coaches coordinate and prepare for recurring client sessions.",
      expectedResults: [makePrimitiveId("result-less-manual-scheduling")],
      id: makePrimitiveId("obj-improve-coach-utilization"),
      name: "Improve coach utilization",
      status: "Active",
      successCriteria: "Coaches spend less time coordinating sessions and more time preparing.",
      type: "Objective",
      workflows: [makePrimitiveId("workflow-session-scheduling")]
    }
  ],
  identifier: "Objective",
  title: "Objective"
})

export type Objective = typeof Objective.Type
