import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { Reference, ReferenceArray } from "../Reference.js"

export const Story = Schema.Struct({
  type: Schema.Literal("Story"),
  ...PrimitiveBaseFields,
  actor: Schema.optional(Reference),
  capability: Schema.optional(Reference),
  expectedResult: Schema.optional(Reference),
  text: Schema.optional(
    Schema.String.annotations({
      description: "Stored story text; generated from linked primitives when absent",
      identifier: "StoryText",
      title: "Story Text"
    })
  ),
  workflows: Schema.optional(ReferenceArray)
}).annotations({
  description: "Human-readable planning artifact derived from actor, capability, and expected result",
  identifier: "Story",
  title: "Story"
})

export type Story = typeof Story.Type
