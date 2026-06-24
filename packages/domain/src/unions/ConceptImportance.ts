import { Schema } from "@effect/schema"

export const ConceptImportance = Schema.Literal("Primary", "Secondary", "Supporting").annotations({
  description: "Relative importance of a domain concept within a capability concept link",
  identifier: "ConceptImportance",
  title: "Concept Importance"
})

export type ConceptImportance = typeof ConceptImportance.Type
