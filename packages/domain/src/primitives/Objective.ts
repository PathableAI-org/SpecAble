import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Objective = Schema.Struct({
  type: Schema.Literal("Objective"),
  ...PrimitiveBaseFields,
  expectedResults: Schema.optional(ReferenceArray),
  successCriteria: Schema.optional(
    Schema.String.annotations({
      description: "Outcome framing or success criteria for the objective",
      identifier: "ObjectiveSuccessCriteria",
      title: "Success Criteria"
    })
  ),
  workflows: Schema.optional(ReferenceArray)
}).annotations({
  description: "Why work matters; links to workflows and expected results",
  identifier: "Objective",
  title: "Objective"
})

export type Objective = typeof Objective.Type
