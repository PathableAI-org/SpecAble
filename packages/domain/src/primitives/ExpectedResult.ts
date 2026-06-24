import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const ExpectedResult = Schema.Struct({
  type: primitiveTypeLiteral("ExpectedResult"),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Capabilities that produce or materially contribute to this expected result",
        from: "ExpectedResult",
        identifier: "ExpectedResultCapabilities",
        role: "produced-by",
        title: "Capabilities",
        to: "Capability"
      })
    )
  ),
  definition: Schema.optional(
    Schema.String.annotations({
      description: "Definition or notes describing the observable changed state",
      documentation: "State the observable outcome without inventing unsupported metrics.",
      examples: ["Coaches can confirm session details without manual back-and-forth coordination."],
      identifier: "ExpectedResultDefinition",
      title: "Definition"
    })
  ),
  objectives: Schema.optional(
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Objectives that this expected result supports or measures",
        from: "ExpectedResult",
        identifier: "ExpectedResultObjectives",
        requiredWhenActive: true,
        role: "supports",
        title: "Objectives",
        to: "Objective"
      })
    )
  )
}).annotations({
  description: "Observable changed state with producing capabilities and supported objectives",
  documentation:
    "Expected results make objectives observable. They can link back to the capabilities that produce them.",
  examples: [
    {
      capabilities: [makePrimitiveId("cap-schedule-session")],
      definition: "Coaches confirm session details without manual back-and-forth coordination.",
      id: makePrimitiveId("result-less-manual-scheduling"),
      name: "Less manual scheduling",
      objectives: [makePrimitiveId("obj-improve-coach-utilization")],
      status: "Active",
      type: "ExpectedResult"
    }
  ],
  identifier: "ExpectedResult",
  jsonSchema: graphJsonSchema(graphNode("ExpectedResult")),
  title: "Expected Result"
})

export type ExpectedResult = typeof ExpectedResult.Type
