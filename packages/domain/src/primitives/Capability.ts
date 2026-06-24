import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Capability = Schema.Struct({
  type: Schema.Literal("Capability"),
  ...PrimitiveBaseFields,
  actors: Schema.optional(ReferenceArray),
  domainConcepts: Schema.optional(ReferenceArray),
  expectedResults: Schema.optional(ReferenceArray),
  workflows: Schema.optional(ReferenceArray)
}).annotations({
  description: "Reusable operational ability linking actors, outcomes, workflows, and concepts",
  identifier: "Capability",
  title: "Capability"
})

export type Capability = typeof Capability.Type
