import { Schema } from "@effect/schema"

export const PersonaConfidence = Schema.Literal("Hypothesis", "Validated", "Confirmed").annotations({
  description: "Evidence confidence for a persona; Hypothesis exempts evidence requirements during validation",
  identifier: "PersonaConfidence",
  title: "Persona Confidence"
})

export type PersonaConfidence = typeof PersonaConfidence.Type
