import { Schema } from "@effect/schema"

import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Persona = Schema.Struct({
  type: Schema.Literal("Persona"),
  ...PrimitiveBaseFields,
  goalsOrPainPoints: Schema.optional(
    Schema.String.annotations({
      description: "Goals, pain points, or constraints for the persona",
      identifier: "PersonaGoalsOrPainPoints",
      title: "Goals or Pain Points"
    })
  ),
  primaryActors: Schema.optional(ReferenceArray)
}).annotations({
  description: "Evidence-backed archetype distinct from actors",
  identifier: "Persona",
  title: "Persona"
})

export type Persona = typeof Persona.Type
