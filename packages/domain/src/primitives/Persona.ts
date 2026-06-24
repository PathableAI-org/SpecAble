import { Schema } from "@effect/schema"

import { makePrimitiveId, PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Persona = Schema.Struct({
  type: Schema.Literal("Persona").annotations({
    description: "Discriminator value identifying this primitive as Persona",
    documentation: "Use `Persona` in the `type` field only for Persona primitives.",
    examples: ["Persona"],
    identifier: "PersonaType",
    title: "Persona Type"
  }),
  ...PrimitiveBaseFields,
  goalsOrPainPoints: Schema.optional(
    Schema.String.annotations({
      description: "Goals, pain points, or constraints for the persona",
      documentation: "Summarize evidence-backed needs without encoding workflow links as prose-only text.",
      examples: ["Needs to coordinate sessions quickly while maintaining a clear view of client readiness."],
      identifier: "PersonaGoalsOrPainPoints",
      title: "Goals or Pain Points"
    })
  ),
  primaryActors: Schema.optional(
    ReferenceArray.annotations({
      description: "Actors that embody or represent this persona in product behavior",
      documentation:
        "Relationship field: Persona.primaryActors references Actor primitives. Required when the Persona is Active.",
      identifier: "PersonaPrimaryActors",
      title: "Primary Actors"
    })
  )
}).annotations({
  description: "Evidence-backed archetype distinct from actors",
  documentation:
    "Personas describe research-backed archetypes and motivations. Use Actor references to connect them to concrete graph participants.",
  examples: [
    {
      confidence: "Validated",
      goalsOrPainPoints: "Needs reliable session coordination without extra administrative work.",
      id: makePrimitiveId("persona-busy-coach"),
      name: "Busy coach",
      primaryActors: [{ id: makePrimitiveId("actor-care-coach"), role: "Primary" }],
      status: "Active",
      type: "Persona"
    }
  ],
  identifier: "Persona",
  title: "Persona"
})

export type Persona = typeof Persona.Type
