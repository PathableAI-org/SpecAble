import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Objective = Schema.Struct({
  type: primitiveTypeLiteral("Objective"),
  ...PrimitiveBaseFields,
  expectedResults: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Expected results that make this objective observable or measurable",
        from: "Objective",
        identifier: "ObjectiveExpectedResults",
        requiredWhenActive: true,
        role: "measured-by",
        title: "Expected Results",
        to: "ExpectedResult"
      })
    )
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
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Workflows that operationalize this objective",
        from: "Objective",
        identifier: "ObjectiveWorkflows",
        role: "operationalized-by",
        title: "Workflows",
        to: "Workflow"
      })
    )
  )
}).annotations({
  description: "Why work matters; links to workflows and expected results",
  documentation:
    "Objectives capture durable product intent. They should link to expected results and the workflows that realize them.",
  examples: [
    {
      description: "Improve how coaches coordinate and prepare for recurring client sessions.",
      expectedResults: ["result-less-manual-scheduling"],
      id: "obj-improve-coach-utilization",
      name: "Improve coach utilization",
      status: "Active",
      successCriteria: "Coaches spend less time coordinating sessions and more time preparing.",
      type: "Objective",
      workflows: ["workflow-session-scheduling"]
    }
  ],
  identifier: "Objective",
  jsonSchema: graphJsonSchema(graphNode("Objective")),
  title: "Objective"
})

export type Objective = typeof Objective.Type
