import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const ExpectedResult = Schema.Struct({
  type: Schema.Literal("ExpectedResult"),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(ReferenceArray),
  definition: Schema.optional(
    Schema.String.annotations({
      description: "Definition or notes describing the observable changed state",
      identifier: "ExpectedResultDefinition",
      title: "Definition"
    })
  ),
  objectives: Schema.optional(ReferenceArray)
}).annotations({
  description: "Observable changed state with producing capabilities and supported objectives",
  identifier: "ExpectedResult",
  title: "Expected Result"
})

export type ExpectedResult = typeof ExpectedResult.Type
