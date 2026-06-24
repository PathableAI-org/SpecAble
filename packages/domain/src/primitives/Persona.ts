import { Schema } from "@effect/schema"

import { graphJsonSchema, graphNode, primitiveTypeLiteral, relationship } from "../GraphAnnotations.js"
import { PrimitiveBaseFields } from "../PrimitiveBase.js"
import { ReferenceArray } from "../Reference.js"

export const Persona = Schema.Struct({
  type: primitiveTypeLiteral("Persona"),
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
    ReferenceArray.annotations(
      relationship({
        cardinality: "many",
        description: "Actors that embody or represent this persona in product behavior",
        from: "Persona",
        identifier: "PersonaPrimaryActors",
        requiredWhenActive: true,
        role: "represented-by",
        title: "Primary Actors",
        to: "Actor"
      })
    )
  )
}).annotations({
  description: "Evidence-backed archetype distinct from actors",
  documentation:
    "Personas describe research-backed archetypes and motivations. Use Actor references to connect them to concrete graph participants.",
  examples: [
    {
      confidence: "Validated",
      goalsOrPainPoints: "Needs reliable session coordination without extra administrative work.",
      id: "persona-busy-coach",
      name: "Busy coach",
      primaryActors: [{ id: "actor-care-coach", role: "Primary" }],
      status: "Active",
      type: "Persona"
    }
  ],
  identifier: "Persona",
  jsonSchema: graphJsonSchema(graphNode("Persona")),
  title: "Persona"
})

export type Persona = typeof Persona.Type
