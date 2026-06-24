import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const ExpectedResult = Schema.Struct({
  type: Schema.Literal("ExpectedResult").annotations({
    description: "Discriminator value identifying this primitive as Expected Result",
    documentation: "Use `ExpectedResult` in the `type` field only for Expected Result primitives.",
    examples: ["ExpectedResult"],
    identifier: "ExpectedResultType",
    title: "Expected Result Type"
  }),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(
    ReferenceArray.annotations({
      description: "Capabilities that produce or materially contribute to this expected result",
      documentation: "Relationship field: ExpectedResult.capabilities references Capability primitives.",
      identifier: "ExpectedResultCapabilities",
      title: "Capabilities"
    })
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
    ReferenceArray.annotations({
      description: "Objectives that this expected result supports or measures",
      documentation:
        "Relationship field: ExpectedResult.objectives references Objective primitives. Required when the Expected Result is Active.",
      identifier: "ExpectedResultObjectives",
      title: "Objectives"
    })
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
  title: "Expected Result"
})

export type ExpectedResult = typeof ExpectedResult.Type
