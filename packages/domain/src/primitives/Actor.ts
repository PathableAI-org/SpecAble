import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ActorCategory } from "../unions/ActorCategory.js"

export const Actor = Schema.Struct({
  type: primitiveTypeLiteral("Actor"),
  ...PrimitiveBaseFields,
  category: Schema.optional(
    ActorCategory.annotations({
      description: "Classifies what kind of participant this actor represents",
      documentation: "Use this to distinguish people, systems, AI agents, organizations, and external parties.",
      identifier: "ActorCategoryField",
      title: "Category"
    })
  )
}).annotations({
  description: "Participant in product behavior with a category classification",
  documentation:
    "Actors are concrete participants in workflows and capabilities. They are distinct from Personas, which describe evidence-backed user archetypes.",
  examples: [
    {
      category: "Human",
      description: "Coach responsible for preparing and running coaching sessions.",
      id: "actor-care-coach",
      name: "Care coach",
      status: "Active",
      type: "Actor"
    }
  ],
  identifier: "Actor",
  jsonSchema: graphJsonSchema(graphNode("Actor")),
  title: "Actor"
})

export type Actor = typeof Actor.Type
