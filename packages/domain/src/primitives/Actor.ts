import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ActorCategory } from "../unions/ActorCategory.js"

export const Actor = Schema.Struct({
  type: Schema.Literal("Actor"),
  ...PrimitiveBaseFields,
  category: Schema.optional(ActorCategory)
}).annotations({
  description: "Participant in product behavior with a category classification",
  identifier: "Actor",
  title: "Actor"
})

export type Actor = typeof Actor.Type
