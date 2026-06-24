import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ActorCategory } from "../unions/ActorCategory.js"

export const Actor = Schema.Struct({
  type: Schema.Literal("Actor").annotations({
    description: "Discriminator value identifying this primitive as Actor",
    documentation: "Use `Actor` in the `type` field only for Actor primitives.",
    examples: ["Actor"],
    identifier: "ActorType",
    title: "Actor Type"
  }),
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
      id: makePrimitiveId("actor-care-coach"),
      name: "Care coach",
      status: "Active",
      type: "Actor"
    }
  ],
  identifier: "Actor",
  title: "Actor"
})

export type Actor = typeof Actor.Type
