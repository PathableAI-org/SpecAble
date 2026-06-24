import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"

export const DomainConcept = Schema.Struct({
  type: Schema.Literal("DomainConcept"),
  ...PrimitiveBaseFields,
  definition: Schema.optional(
    Schema.String.annotations({
      description: "Semantic definition of the domain concept",
      identifier: "DomainConceptDefinition",
      title: "Definition"
    })
  )
}).annotations({
  description: "Semantic product or domain vocabulary item",
  identifier: "DomainConcept",
  title: "Domain Concept"
})

export type DomainConcept = typeof DomainConcept.Type
