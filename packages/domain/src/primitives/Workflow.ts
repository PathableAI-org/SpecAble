import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Workflow = Schema.Struct({
  type: Schema.Literal("Workflow"),
  ...PrimitiveBaseFields,
  capabilities: Schema.optional(ReferenceArray),
  domainConcepts: Schema.optional(ReferenceArray),
  expectedResults: Schema.optional(ReferenceArray),
  objectives: Schema.optional(ReferenceArray),
  primaryActors: Schema.optional(ReferenceArray),
  sequenceNotes: Schema.optional(
    Schema.String.annotations({
      description: "Step or sequence notes explaining the operational flow",
      identifier: "WorkflowSequenceNotes",
      title: "Sequence Notes"
    })
  ),
  stories: Schema.optional(ReferenceArray)
}).annotations({
  description: "Operational sequence linking objectives, actors, capabilities, and stories",
  identifier: "Workflow",
  title: "Workflow"
})

export type Workflow = typeof Workflow.Type
