import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"

export const DomainConcept = Schema.Struct({
  type: primitiveTypeLiteral("DomainConcept"),
  ...PrimitiveBaseFields,
  definition: Schema.optional(
    Schema.String.annotations({
      description: "Semantic definition of the domain concept",
      documentation:
        "Define the concept's meaning in the product domain so capabilities can reference it consistently.",
      examples: ["A scheduled coaching appointment between a coach and one or more clients."],
      identifier: "DomainConceptDefinition",
      title: "Definition"
    })
  )
}).annotations({
  description: "Semantic product or domain vocabulary item",
  documentation:
    "Domain concepts define the vocabulary that capabilities read, create, update, or otherwise manipulate.",
  examples: [
    {
      definition: "A scheduled coaching appointment between a coach and one or more clients.",
      id: "concept-session",
      name: "Session",
      status: "Active",
      type: "DomainConcept"
    }
  ],
  identifier: "DomainConcept",
  jsonSchema: graphJsonSchema(graphNode("DomainConcept")),
  title: "Domain Concept"
})

export type DomainConcept = typeof DomainConcept.Type
